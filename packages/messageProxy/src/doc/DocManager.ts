import { ConnectionId, WebSocketConnection } from '../ws/types';
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
    private connections: Map<ConnectionId, WebSocketConnection> = new Map();

    constructor(docId: string) {
        this.id = docId;
    }

    addConnection(client: WebSocketConnection) {
        if (!this.contains(client.id)) {
            this.connections.set(client.id, client);
        }
    }

    removeConnection(connectionId: ConnectionId) {
        if (this.contains(connectionId)) {
            this.connections.delete(connectionId);
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

    broadcastDiff(authorConnectionId: ConnectionId, changes: Changes) {
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

    broadcastAwareness(authorConnectionId: ConnectionId, awareness: Awareness) {
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

    contains(connectionId: ConnectionId): boolean {
        return this.connections.has(connectionId);
    }
}
