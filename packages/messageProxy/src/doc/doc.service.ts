import { Injectable } from '@nestjs/common';
import { DocManager } from './DocManager';
import { ChangesPayload } from '../ws/events/changes';
import { BroadcastMessage } from '../pubsub/types';
import { PubsubService } from '../pubsub/pubsub.service';

@Injectable()
export class DocService {
  private docs: Map<string, DocManager>;

  constructor(private pubsub: PubsubService) {
    this.docs = new Map();

    this.pubsub.addOnPublish((channel, message) => {
      const docId = channel;
      const broadcastMessage: BroadcastMessage = JSON.parse(message);

      if (this.docs.has(docId)) {
        const doc = this.docs.get(docId);
        doc.broadcastDiff(broadcastMessage.client, broadcastMessage.changes);
      }
    });
  }

  applyDiff(client: WebSocket, payload: ChangesPayload) {
    const doc = this.docs.get(payload.docId);

    this.pubsub.publish(doc.id, JSON.stringify({
      client: client,
      changes: payload.changes,
    }))
  }

  joinToDoc(client: any, docId: string): void {
    let doc: DocManager;
    if (this.docs.has(docId)) {
      doc = this.docs.get(docId);
    } else {
      doc = new DocManager(docId);
      this.docs.set(docId, doc);
    }
    doc.addUser(client);

    this.pubsub.subscribe(docId);
  }


}
