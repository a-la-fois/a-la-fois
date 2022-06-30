import { Injectable } from "@nestjs/common";
import { DocManager } from "./DocManager";
import { ChangesPayload } from "../ws/events/changes";

@Injectable()
export class DocService {
  private docs: Map<string, DocManager>;

  constructor() {
    this.docs = new Map();
  }

  getOrCreateDoc(id: string): DocManager {
    if (this.docs.has(id)) {
      return this.docs.get(id);
    } else {
      const doc = new DocManager(id)
      this.docs.set(id, doc);
      return doc;
    }
  }

  applyDiff(client: WebSocket, payload: ChangesPayload) {
    const doc = this.getOrCreateDoc(payload.docId);

    doc.broadcastDiff(client, payload);
  }

  joinToDoc(client: any, docId: string): void {
    const doc = this.getOrCreateDoc(docId);
    doc.addUser(client);
  }


}
