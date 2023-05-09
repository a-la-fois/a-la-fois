import {
    Awareness,
    broadcastAwarenessEvent,
    BroadcastAwarenessMessage,
    broadcastChangesEvent,
    BroadcastChangesMessage,
    Changes,
} from '../messages';

type connection = { id: string; send: Function; close: Function } & Object;

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

    removeConnection(client: connection) {
        if (this.contains(client)) {
            this.connections.delete(client.id);
        }
    }

    removeAndDisconnectAll() {
        for (const [_, connection] of this.connections) {
            connection.close();
        }
        this.connections.clear();
    }

    isEmpty() {
        return this.connections.size === 0;
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

    broadcastAwareness(authorClient: connection, awareness: Awareness) {
        for (const [, connection] of this.connections) {
            if (connection.id !== authorClient.id) {
                const message: BroadcastAwarenessMessage = {
                    event: broadcastAwarenessEvent,
                    data: {
                        docId: this.id,
                        awareness,
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
