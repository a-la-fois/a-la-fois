import { Changes } from "./types";

export class DocManager {
  readonly id: string;
  connections: WebSocket[] = [];

  constructor(docId: string) {
    this.id = docId;
  }

  addUser(socket: any) {
    if (this.connections.indexOf(socket) === -1) {
      this.connections.push(socket);
    }
  }

  broadcastDiff(authorSocket: WebSocket, changes: Changes) {
    this.connections
      .filter(socket => {
        return socket !== authorSocket;
      })
      .map(socket => {
        socket.send(changes);
      })
  }
}