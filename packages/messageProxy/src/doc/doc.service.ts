import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { DocManager } from './DocManager';
import {
    ChangesPayload,
    SyncStartPayload,
    SyncResponsePayload,
    SyncCompletePayload,
    JoinResponsePayload,
    AwarenessPayload,
} from '../messages';
import { BroadcastMessage, PubSub } from '../pubsub/types';
import { WebSocketClient } from '../ws/types';
import { KafkaPubSubToken } from '../pubsub/kafka-pubsub.service';
import { ActorService } from '../actor/actor.service';
import { DocKey } from './types';
import { NotJoinedError } from '../errors';

@Injectable()
export class DocService implements OnModuleDestroy {
    private docs: Map<string, DocManager> = new Map();

    // Optimization for disconnections
    // When client disconnects we only have connectionId
    // so we store a map: connectionId -> docs
    // to find all connected documents of a client fast (not iterating over docs map)
    private connectionsToDocs: Map<string, DocManager[]> = new Map();

    constructor(@Inject(KafkaPubSubToken) private readonly pubsub: PubSub<DocKey>, private actorService: ActorService) {
        this.pubsub.connect();
        this.pubsub.addCallback(this.onPublishCallback);
    }

    applyChanges(client: WebSocketClient, payload: ChangesPayload) {
        this.assertClientJoined(payload.docId);

        const doc = this.docs.get(payload.docId);
        doc.broadcastDiff(client, payload.changes);

        // Sending changes to other instances
        this.pubsub.publish(doc.id, {
            author: client,
            type: 'changes',
            data: payload.changes,
        } as BroadcastMessage);

        this.actorService.sendChanges(client.id, payload);
    }

    applyAwareness(client: WebSocketClient, payload: AwarenessPayload) {
        this.assertClientJoined(payload.docId);

        const doc = this.docs.get(payload.docId);
        doc.broadcastAwareness(client, payload.awareness);

        this.pubsub.publish(doc.id, {
            author: client,
            type: 'awareness',
            data: payload.awareness,
        } as BroadcastMessage);
    }

    async syncStart(client: WebSocketClient, payload: SyncStartPayload): Promise<SyncResponsePayload> {
        return await this.actorService.syncStart(payload);
    }

    syncComplete(client: WebSocketClient, payload: SyncCompletePayload) {
        this.actorService.syncComplete(client.id, payload);
    }

    joinToDoc(client: WebSocketClient, docId: DocKey): JoinResponsePayload {
        let doc: DocManager;
        if (this.docs.has(docId)) {
            doc = this.docs.get(docId);
        } else {
            doc = new DocManager(docId);
            this.docs.set(docId, doc);

            let joinedDocs = this.connectionsToDocs.get(client.id);
            if (joinedDocs) {
                joinedDocs.push(doc);
            } else {
                joinedDocs = [doc];
            }
            this.connectionsToDocs.set(client.id, joinedDocs);
        }
        doc.addConnection(client);
        console.log(this.connectionsToDocs);
        this.pubsub.subscribe(docId);

        return {
            docId,
            status: 'ok',
        };
    }

    private onPublishCallback = (channel: DocKey, message: string) => {
        const docId = channel;
        const broadcastMessage: BroadcastMessage = JSON.parse(message);

        // Do nothing if there are no connections in this instance
        if (!this.docs.has(docId)) {
            return;
        }

        const doc = this.docs.get(docId);

        // If an author of changes is in this instance -> do nothing
        // Because we already sent diffs from this instance
        if (doc.contains(broadcastMessage.author)) {
            return;
        }

        switch (broadcastMessage.type) {
            case 'changes': {
                doc.broadcastDiff(broadcastMessage.author, broadcastMessage.data);
                break;
            }
            case 'awareness': {
                doc.broadcastAwareness(broadcastMessage.author, broadcastMessage.data);
                break;
            }
        }
    };

    private assertClientJoined(docId: string) {
        if (!this.docs.has(docId)) {
            throw new NotJoinedError(docId);
        }
    }

    disconnect(client: WebSocketClient) {
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
        this.pubsub.disconnect();
        for (const [_, doc] of this.docs) {
            doc.removeAndDisconnectAll();
        }
    }
}
