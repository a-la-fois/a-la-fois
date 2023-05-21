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
    UpdateTokenBroadcastMessage,
    updateTokenBroadcastMessageType,
} from '../pubsub/types';
import { WebSocketConnection } from '../ws/types';
import { ActorService } from '../actor/actor.service';
import { DocKey } from './types';
import { NotJoinedError } from '../errors';
import { PubsubService } from 'src/pubsub/pubsub.service';

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
        this.pubsub.subscribe(updateTokenBroadcastMessageType, this.onUpdateTokenMessage);
    }

    applyChanges(client: WebSocketConnection, payload: ChangesPayload) {
        this.assertClientJoined(client, payload.docId);

        const doc = this.docs.get(payload.docId);
        doc.broadcastDiff(client.id, payload.changes);

        // Sending changes to other instances
        const message: ChangesBroadcastMessage = {
            type: 'changes',
            message: {
                author: client.id,
                docId: doc.id,
                data: payload.changes,
            },
        };
        this.pubsub.publish(message);

        this.actorService.sendChanges(client.id, payload);
    }

    applyAwareness(client: WebSocketConnection, payload: AwarenessPayload) {
        this.assertClientJoined(client, payload.docId);

        const doc = this.docs.get(payload.docId);
        doc.broadcastAwareness(client.id, payload.awareness);

        // Sending awareness to other instances
        const message: AwarenessBroadcastMessage = {
            type: 'awareness',
            message: {
                author: client.id,
                docId: doc.id,
                data: payload.awareness,
            },
        };
        this.pubsub.publish(message);
    }

    async syncStart(client: WebSocketConnection, payload: SyncStartPayload): Promise<SyncResponsePayload> {
        return await this.actorService.syncStart(payload);
    }

    syncComplete(client: WebSocketConnection, payload: SyncCompletePayload) {
        this.actorService.syncComplete(client.id, payload);
    }

    joinToDoc(client: WebSocketConnection, docId: DocKey): JoinResponsePayload {
        let doc: DocManager;

        if (this.docs.has(docId)) {
            doc = this.docs.get(docId);
        } else {
            doc = new DocManager(docId);
            this.docs.set(docId, doc);
        }
        doc.addConnection(client);

        let joinedDocs = this.connectionsToDocs.get(client.id);

        if (joinedDocs) {
            joinedDocs.push(doc);
        } else {
            joinedDocs = [doc];
        }
        this.connectionsToDocs.set(client.id, joinedDocs);

        return {
            docId,
            status: 'ok',
        };
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

    private assertClientJoined(client: WebSocketConnection, docId: string) {
        const doc = this.docs.get(docId);

        if (!doc || !doc.has(client)) {
            throw new NotJoinedError(docId);
        }
    }

    disconnect(client: WebSocketConnection) {
        const joinedDocs = this.connectionsToDocs.get(client.id);

        if (!joinedDocs) {
            return;
        }

        for (const i in joinedDocs) {
            joinedDocs[i].removeConnection(client);

            if (joinedDocs[i].isEmpty()) {
                this.docs.delete(joinedDocs[i].id);
            }
        }

        this.connectionsToDocs.delete(client.id);
    }

    onModuleDestroy() {
        for (const [_, doc] of this.docs) {
            doc.removeAndDisconnectAll();
        }
    }
}
