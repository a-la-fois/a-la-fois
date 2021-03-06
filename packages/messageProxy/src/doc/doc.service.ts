import { Injectable } from '@nestjs/common';
import { DocManager } from './DocManager';
import { ChangesPayload } from '../ws/events/changes';
import { BroadcastMessage } from '../pubsub/types';
import { PubsubService } from '../pubsub/pubsub.service';
import { WebSocketClient } from '../ws/types';

@Injectable()
export class DocService {
  private docs: Map<string, DocManager> = new Map();

  constructor(private pubsub: PubsubService) {
    this.pubsub.addOnPublish(this.onPublishCallback);
  }

  applyDiff(client: WebSocketClient, payload: ChangesPayload) {
    const doc = this.docs.get(payload.docId);
    doc.broadcastDiff(client, payload.changes);

    // Sending changes to other instances
    this.pubsub.publish(doc.id, JSON.stringify({
      author: client,
      changes: payload.changes,
    }))
  }

  joinToDoc(client: WebSocketClient, docId: string): void {
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

  private onPublishCallback = (channel: string, message: string) => {
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
  }

}
