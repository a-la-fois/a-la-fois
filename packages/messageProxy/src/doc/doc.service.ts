import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { DocManager } from './DocManager';
import {
    ChangesPayload,
    Changes,
    SyncStartPayload,
    SyncResponsePayload,
    SyncCompletePayload,
    JoinResponsePayload,
} from '../messages';
import { BroadcastMessage, PubSub } from '../pubsub/types';
import { WebSocketClient } from '../ws/types';
import { KafkaPubSubToken } from '../pubsub/kafka-pubsub.service';
import { ActorService } from '../actor/actor.service';
import { DocKey } from './types';
import { JoinResponseStatus } from 'src/messages/joinResponse';

@Injectable()
export class DocService implements OnModuleDestroy {
    private docs: Map<string, DocManager> = new Map();

    constructor(
        @Inject(KafkaPubSubToken) private readonly pubsub: PubSub<DocKey, Changes>,
        private actorService: ActorService
    ) {
        this.pubsub.connect();
        this.pubsub.addCallback(this.onPublishCallback);
    }

    applyDiff(client: WebSocketClient, payload: ChangesPayload) {
        const doc = this.docs.get(payload.docId);
        doc.broadcastDiff(client, payload.changes);

        // Sending changes to other instances
        this.pubsub.publish(
            doc.id,
            JSON.stringify({
                author: client,
                changes: payload.changes,
            } as BroadcastMessage)
        );

        this.actorService.sendChanges(payload);
    }

    async syncStart(client: WebSocketClient, payload: SyncStartPayload): Promise<SyncResponsePayload> {
        return await this.actorService.syncStart(payload);
    }

    syncComplete(client: WebSocketClient, payload: SyncCompletePayload) {
        this.actorService.syncComplete(payload);
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

        this.pubsub.subscribe(docId);

        return {
            docId,
            status: JoinResponseStatus.ok,
        };
    }

    private onPublishCallback = (channel: DocKey, message: string) => {
        const docId = channel;
        const broadcastMessage: BroadcastMessage = JSON.parse(message);

        // Do nothing if there are no connections in this instance
        if (this.docs.has(docId)) {
            const doc = this.docs.get(docId);

            // If an author of changes is in this instance -> do nothing
            // Because we already sent diffs from this instance
            if (!doc.contains(broadcastMessage.author)) {
                doc.broadcastDiff(broadcastMessage.author, broadcastMessage.changes);
            }
        }
    };

    onModuleDestroy() {
        this.pubsub.disconnect();
        //TODO: Close websocket connections
    }
}
