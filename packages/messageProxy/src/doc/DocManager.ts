import { Changes } from "./types";

type connection = { send: Function, id: string } & Object;

export class DocManager {
  readonly id: string;
  private connections: connection[] = [];
  // for performance issues
  private connectionsMap: Map<string, connection> = new Map();

  constructor(docId: string) {
    this.id = docId;
  }

  addUser(client: connection) {
    if (!this.contains(client)) {
      this.connections.push(client);
      this.connectionsMap.set(client.id, client);
    }
  }

  broadcastDiff(authorClient: connection, changes: Changes) {
    this.connections
      .filter(client => {
        return client.id !== authorClient.id;
      })
      .map(client => {
        client.send(changes);
      })
  }

  contains(client: connection): boolean {
    return this.connectionsMap.has(client.id)
  }
}