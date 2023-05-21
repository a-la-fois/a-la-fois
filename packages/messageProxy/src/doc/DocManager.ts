import { WebSocketConnection } from 'src/ws/types';
import {
    Awareness,
    broadcastAwarenessEvent,
    BroadcastAwarenessMessage,
    broadcastChangesEvent,
    BroadcastChangesMessage,
    Changes,
} from '../messages';

export class DocManager {
    readonly id: string;
    private connections: Map<string, WebSocketConnection> = new Map();

    constructor(docId: string) {
        this.id = docId;
    }

    addConnection(client: WebSocketConnection) {
        if (!this.contains(client.id)) {
            this.connections.set(client.id, client);
        }
    }

    removeConnection(client: WebSocketConnection) {
        if (this.contains(client.id)) {
            this.connections.delete(client.id);
        }
    }

    removeAndDisconnectAll() {
        for (const [_, connection] of this.connections) {
            connection.close();
        }
        this.connections.clear();
    }

    has(client: WebSocketConnection) {
        return this.connections.has(client.id);
    }

    isEmpty() {
        return this.connections.size === 0;
    }

    broadcastDiff(authorConnectionId: string, changes: Changes) {
        for (const [, connection] of this.connections) {
            if (connection.id !== authorConnectionId) {
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

    broadcastAwareness(authorConnectionId: string, awareness: Awareness) {
        for (const [, connection] of this.connections) {
            if (connection.id !== authorConnectionId) {
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

    contains(clientId: string): boolean {
        return this.connections.has(clientId);
    }
}
