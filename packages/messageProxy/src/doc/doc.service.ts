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
import { KafkaPubSubToken, TOPICS } from '../pubsub/kafka-pubsub.service';
import { ActorService } from '../actor/actor.service';
import { DocKey } from './types';
import { NotJoinedError } from '../errors';

@Injectable()
export class DocService implements OnModuleDestroy {
    private docs: Map<string, DocManager> = new Map();
    private changesTopic: string = TOPICS.changes;
    private serviceTopic: string = TOPICS.service;

    // Optimization for disconnections
    // When client disconnects we only have connectionId
    // so we store a map: connectionId -> docs
    // to find all connected documents of a client fast (not iterating over docs map)
    private connectionsToDocs: Map<string, DocManager[]> = new Map();

    constructor(@Inject(KafkaPubSubToken) private readonly pubsub: PubSub<string>, private actorService: ActorService) {
        this.pubsub.addCallback(this.changesTopic, this.onChangeEvent);
        this.pubsub.addCallback(this.serviceTopic, this.onServiceEvent);
    }

    applyChanges(client: WebSocketClient, payload: ChangesPayload) {
        this.assertClientJoined(client, payload.docId);

        const doc = this.docs.get(payload.docId);
        doc.broadcastDiff(client, payload.changes);

        // Sending changes to other instances
        this.pubsub.publish(this.changesTopic, doc.id, {
            author: client,
            type: 'changes',
            data: payload.changes,
        } as BroadcastMessage);

        this.actorService.sendChanges(client.id, payload);
    }

    applyAwareness(client: WebSocketClient, payload: AwarenessPayload) {
        this.assertClientJoined(client, payload.docId);

        const doc = this.docs.get(payload.docId);
        doc.broadcastAwareness(client, payload.awareness);

        this.pubsub.publish(this.changesTopic, doc.id, {
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

    private onChangeEvent = (key: DocKey, message: string) => {
        const docId = key;
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

    private onServiceEvent = (key: string, message: string) => {
        const broadcastMessage: BroadcastMessage = JSON.parse(message);
        console.debug(broadcastMessage);
    };

    private assertClientJoined(client: WebSocketClient, docId: string) {
        const doc = this.docs.get(docId);

        if (!doc || !doc.has(client)) {
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
        for (const [_, doc] of this.docs) {
            doc.removeAndDisconnectAll();
        }
    }
}
