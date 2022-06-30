import { ChangesPayload } from "../ws/events/changes";

export class DocManager {
  private readonly docId: string;
  connections: WebSocket[] = [];

  constructor(docId: string) {
    this.docId = docId;
  }

  addUser(socket: any) {
    if (this.connections.indexOf(socket) === -1) {
      this.connections.push(socket);
    }
  }

  broadcastDiff(authorSocket: WebSocket, diff: ChangesPayload) {
    this.connections
      .filter(socket => {
        return socket !== authorSocket;
      })
      .map(socket => {
        socket.send(diff.changes);
      })
  }
}