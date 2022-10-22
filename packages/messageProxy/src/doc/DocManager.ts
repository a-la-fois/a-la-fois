import { broadcastChangesEvent, BroadcastChangesMessage, Changes } from '../messages';

type connection = { send: Function; id: string } & Object;

export class DocManager {
    readonly id: string;
    private connections: Map<string, connection> = new Map();

    constructor(docId: string) {
        this.id = docId;
    }

    addConnection(client: connection) {
        if (!this.contains(client)) {
            this.connections.set(client.id, client);
        }
    }

    broadcastDiff(authorClient: connection, changes: Changes) {
        for (const [, connection] of this.connections) {
            if (connection.id !== authorClient.id) {
                const message: BroadcastChangesMessage = {
                    event: broadcastChangesEvent,
                    data: {
                        docId: this.id,
                        changes,
                    },
                };
                connection.send(JSON.stringify(message));
            }
        }
    }

    contains(client: connection): boolean {
        return this.connections.has(client.id);
    }
}
