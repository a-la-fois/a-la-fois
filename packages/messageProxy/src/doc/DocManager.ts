import { WebSocketClient } from 'src/ws/types';
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
    private connections: Map<string, WebSocketClient> = new Map();

    constructor(docId: string) {
        this.id = docId;
    }

    addConnection(client: WebSocketClient) {
        if (!this.contains(client)) {
            this.connections.set(client.id, client);
        }
    }

    removeConnection(client: WebSocketClient) {
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

    has(client: WebSocketClient) {
        return this.connections.has(client.id);
    }

    isEmpty() {
        return this.connections.size === 0;
    }

    broadcastDiff(authorClient: WebSocketClient, changes: Changes) {
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

    broadcastAwareness(authorClient: WebSocketClient, awareness: Awareness) {
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

    contains(client: WebSocketClient): boolean {
        return this.connections.has(client.id);
    }
}
