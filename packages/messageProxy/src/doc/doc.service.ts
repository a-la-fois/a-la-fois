import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DocManager } from './DocManager';
import {
    ChangesPayload,
    SyncStartPayload,
    SyncResponsePayload,
    SyncCompletePayload,
    JoinResponsePayload,
    AwarenessPayload,
} from '../messages';

import { WebSocketConnection } from '../ws/types';
import { ActorService } from '../actor/actor.service';
import { DocKey } from './types';
import { NotJoinedError } from '../errors';
import {
    awarenessMessageType,
    AwarenessPubsubMessage,
    attachDocMessageType,
    AttachDocPubsubMessage,
    changesMessageType,
    ChangesPubsubMessage,
    detachDocMessageType,
    DetachDocPubsubMessage,
    disconnectMessageType,
    DisconnectPubsubMessage,
    Pubsub,
    PubsubDecorator,
} from '@a-la-fois/pubsub';
import { LoggerService } from '@a-la-fois/nest-common';

@Injectable()
export class DocService implements OnModuleDestroy {
    private docs: Map<string, DocManager> = new Map();

    // Optimization for disconnections
    // When client disconnects we only have connectionId
    // so we store a map: connectionId -> docs
    // to find all connected documents of a client fast (not iterating over docs map)
    private connectionsToDocs: Map<string, DocManager[]> = new Map();
    logger: LoggerService;

    constructor(
        @PubsubDecorator() private readonly pubsub: Pubsub,
        private actorService: ActorService,
        loggerService: LoggerService,
    ) {
        this.logger = loggerService.child({ module: this.constructor.name });

        this.pubsub.subscribe<typeof changesMessageType>(changesMessageType, this.onChangesOrAwarenessMessage);
        this.pubsub.subscribe<typeof awarenessMessageType>(awarenessMessageType, this.onChangesOrAwarenessMessage);
        this.pubsub.subscribe<typeof attachDocMessageType>(attachDocMessageType, this.onAttachDocMessage);
        this.pubsub.subscribe<typeof detachDocMessageType>(detachDocMessageType, this.onDetachDocMessage);
        this.pubsub.subscribe<typeof disconnectMessageType>(disconnectMessageType, this.onDisconnectMessage);
    }

    applyChanges(conn: WebSocketConnection, payload: ChangesPayload) {
        this.assertClientJoined(conn, payload.docId);

        const doc = this.docs.get(payload.docId);
        doc.broadcastDiff(conn.id, payload.changes);

        // Sending changes to other instances
        this.pubsub.publish({
            type: 'changes',
            message: {
                author: conn.id,
                docId: doc.id,
                data: payload.changes,
            },
        } as ChangesPubsubMessage);

        this.actorService.sendChanges(conn.id, payload);
    }

    applyAwareness(conn: WebSocketConnection, payload: AwarenessPayload) {
        this.assertClientJoined(conn, payload.docId);

        const doc = this.docs.get(payload.docId);
        doc.broadcastAwareness(conn.id, payload.awareness);

        // Sending awareness to other instances
        this.pubsub.publish({
            type: 'awareness',
            message: {
                author: conn.id,
                docId: doc.id,
                data: payload.awareness,
            },
        } as AwarenessPubsubMessage);
    }

    async syncStart(_conn: WebSocketConnection, payload: SyncStartPayload): Promise<SyncResponsePayload> {
        return await this.actorService.syncStart(payload);
    }

    syncComplete(conn: WebSocketConnection, payload: SyncCompletePayload) {
        this.actorService.syncComplete(conn.id, payload);
    }

    joinToDoc(conn: WebSocketConnection, docId: DocKey): JoinResponsePayload {
        let doc: DocManager;

        if (this.docs.has(docId)) {
            doc = this.docs.get(docId);
        } else {
            doc = new DocManager(docId);
            this.docs.set(docId, doc);
        }
        doc.addConnection(conn);

        let joinedDocs = this.connectionsToDocs.get(conn.id);

        if (joinedDocs) {
            joinedDocs.push(doc);
        } else {
            joinedDocs = [doc];
        }
        this.connectionsToDocs.set(conn.id, joinedDocs);

        return {
            docId,
            status: 'ok',
        };
    }

    private detachDoc(connId: string, docId: DocKey) {
        const doc = this.docs.get(docId);
        if (doc && doc.contains(connId)) {
            doc.removeConnection(connId);

            // If this is the only one connection
            // remove docManager and delete connection -> docManager relation
            if (doc.isEmpty()) {
                this.connectionsToDocs.delete(connId);
                this.docs.delete(docId);
            }
        }
    }

    private onChangesOrAwarenessMessage = (message: ChangesPubsubMessage | AwarenessPubsubMessage) => {
        const docId = message.message.docId;

        // Do nothing if there are no connections in this instance
        if (!this.docs.has(docId)) {
            return;
        }

        const doc = this.docs.get(docId);

        // If an author of changes is in this instance -> do nothing
        // Because we already sent diffs from this instance
        if (doc.contains(message.message.author)) {
            return;
        }

        this.logger.debug({ docId, author: message.message.author, type: message.type }, 'Message received');

        switch (message.type) {
            case 'changes':
                doc.broadcastDiff(message.message.author, message.message.data);
                break;
            case 'awareness':
                doc.broadcastAwareness(message.message.author, message.message.data);
                break;
        }
    };

    private onDetachDocMessage = (message: DetachDocPubsubMessage) => {
        this.logger.debug(
            { docs: message.message.docs, connId: message.message.connectionId },
            'Detach doc message received',
        );

        for (const docId of message.message.docs) {
            this.detachDoc(message.message.connectionId, docId);
        }
    };

    private onAttachDocMessage = (message: AttachDocPubsubMessage) => {
        this.logger.debug(
            {
                connId: message.message.connection.id,
                userId: message.message.connection.userId,
                consumerId: message.message.connection.consumerId,
            },
            'Attach doc message received',
        );

        for (const docId of message.message.docs) {
            this.joinToDoc(message.message.connection, docId);
        }
    };

    private onDisconnectMessage = (message: DisconnectPubsubMessage) => {
        this.logger.debug({ connId: message.message.connectionId }, 'Dissconnect message received');
        this.disconnect(message.message.connectionId);
    };

    private assertClientJoined(connection: WebSocketConnection, docId: string) {
        const doc = this.docs.get(docId);

        if (!doc || !doc.contains(connection.id)) {
            throw new NotJoinedError(docId);
        }
    }

    disconnect(connId: string) {
        const joinedDocs = this.connectionsToDocs.get(connId);

        if (!joinedDocs) {
            return;
        }

        for (const i in joinedDocs) {
            joinedDocs[i].removeConnection(connId);

            if (joinedDocs[i].isEmpty()) {
                this.docs.delete(joinedDocs[i].id);
            }
        }

        this.connectionsToDocs.delete(connId);
    }

    onModuleDestroy() {
        for (const [_, doc] of this.docs) {
            doc.removeAndDisconnectAll();
        }
    }
}
