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

import {
    AwarenessBroadcastMessage,
    awarenessBroadcastMessageType,
    ChangesBroadcastMessage,
    changesBroadcastMessageType,
    DetachDocBroadcastMessage,
    detachDocBroadcastMessageType,
} from '../pubsub/types';
import { WebSocketConnection } from '../ws/types';
import { ActorService } from '../actor/actor.service';
import { DocKey } from './types';
import { NotJoinedError } from '../errors';
import { PubsubService } from 'src/pubsub/pubsub.service';
import { AttachDocBroadcastMessage, attachDocBroadcastMessageType } from 'src/pubsub/types/attachDocMessage';

@Injectable()
export class DocService implements OnModuleDestroy {
    private docs: Map<string, DocManager> = new Map();

    // Optimization for disconnections
    // When client disconnects we only have connectionId
    // so we store a map: connectionId -> docs
    // to find all connected documents of a client fast (not iterating over docs map)
    private connectionsToDocs: Map<string, DocManager[]> = new Map();

    constructor(private readonly pubsub: PubsubService, private actorService: ActorService) {
        this.pubsub.subscribe(changesBroadcastMessageType, this.onChangesOrAwarenessMessage);
        this.pubsub.subscribe(awarenessBroadcastMessageType, this.onChangesOrAwarenessMessage);
        this.pubsub.subscribe(detachDocBroadcastMessageType, this.onDetachDocMessage);
        this.pubsub.subscribe(attachDocBroadcastMessageType, this.onAttachDocMessage);
    }

    applyChanges(connection: WebSocketConnection, payload: ChangesPayload) {
        this.assertClientJoined(connection, payload.docId);

        const doc = this.docs.get(payload.docId);
        doc.broadcastDiff(connection.id, payload.changes);

        // Sending changes to other instances
        this.pubsub.publish({
            type: 'changes',
            message: {
                author: connection.id,
                docId: doc.id,
                data: payload.changes,
            },
        } as ChangesBroadcastMessage);

        this.actorService.sendChanges(connection.id, payload);
    }

    applyAwareness(connection: WebSocketConnection, payload: AwarenessPayload) {
        this.assertClientJoined(connection, payload.docId);

        const doc = this.docs.get(payload.docId);
        doc.broadcastAwareness(connection.id, payload.awareness);

        // Sending awareness to other instances
        this.pubsub.publish({
            type: 'awareness',
            message: {
                author: connection.id,
                docId: doc.id,
                data: payload.awareness,
            },
        } as AwarenessBroadcastMessage);
    }

    async syncStart(connection: WebSocketConnection, payload: SyncStartPayload): Promise<SyncResponsePayload> {
        return await this.actorService.syncStart(payload);
    }

    syncComplete(connection: WebSocketConnection, payload: SyncCompletePayload) {
        this.actorService.syncComplete(connection.id, payload);
    }

    joinToDoc(connection: WebSocketConnection, docId: DocKey): JoinResponsePayload {
        let doc: DocManager;

        if (this.docs.has(docId)) {
            doc = this.docs.get(docId);
        } else {
            doc = new DocManager(docId);
            this.docs.set(docId, doc);
        }
        doc.addConnection(connection);

        let joinedDocs = this.connectionsToDocs.get(connection.id);

        if (joinedDocs) {
            joinedDocs.push(doc);
        } else {
            joinedDocs = [doc];
        }
        this.connectionsToDocs.set(connection.id, joinedDocs);

        return {
            docId,
            status: 'ok',
        };
    }

    private detachDoc(connectionId: string, docId: DocKey) {
        const doc = this.docs.get(docId);
        if (doc && doc.contains(connectionId)) {
            doc.removeConnection(connectionId);

            // If this is the only one connection
            // remove docManager and delete connection -> docManager relation
            if (doc.isEmpty()) {
                this.connectionsToDocs.delete(connectionId);
                this.docs.delete(docId);
            }
        }
    }

    private onChangesOrAwarenessMessage = (message: ChangesBroadcastMessage | AwarenessBroadcastMessage) => {
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

        switch (message.type) {
            case 'changes':
                doc.broadcastDiff(message.message.author, message.message.data);
                break;
            case 'awareness':
                doc.broadcastAwareness(message.message.author, message.message.data);
                break;
        }
    };

    private onDetachDocMessage = (message: DetachDocBroadcastMessage) => {
        for (const docId of message.message.docs) {
            this.detachDoc(message.message.connectionId, docId);
        }
    };

    private onAttachDocMessage = (message: AttachDocBroadcastMessage) => {
        for (const docId of message.message.docs) {
            this.joinToDoc(message.message.connection, docId);
        }
    };

    private assertClientJoined(connection: WebSocketConnection, docId: string) {
        const doc = this.docs.get(docId);

        if (!doc || !doc.contains(connection.id)) {
            throw new NotJoinedError(docId);
        }
    }

    disconnect(connection: WebSocketConnection) {
        const joinedDocs = this.connectionsToDocs.get(connection.id);

        if (!joinedDocs) {
            return;
        }

        for (const i in joinedDocs) {
            joinedDocs[i].removeConnection(connection.id);

            if (joinedDocs[i].isEmpty()) {
                this.docs.delete(joinedDocs[i].id);
            }
        }

        this.connectionsToDocs.delete(connection.id);
    }

    onModuleDestroy() {
        for (const [_, doc] of this.docs) {
            doc.removeAndDisconnectAll();
        }
    }
}
