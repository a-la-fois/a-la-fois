import { Injectable } from '@nestjs/common';
import { DocKey } from 'src/doc/types';
import { UpdateTokenServiceEvent } from 'src/messages';
import { PubsubService } from 'src/pubsub/pubsub.service';
import {
    DetachDocBroadcastMessage,
    UpdateTokenBroadcastMessage,
    updateTokenBroadcastMessageType,
} from 'src/pubsub/types';
import { AttachDocBroadcastMessage } from 'src/pubsub/types/attachDocMessage';
import { AccessData, WebSocketConnection } from 'src/ws/types';
import { createAccessObject } from './utils';

type TokenRightsDiff = {
    added: AccessData[];
    changed: AccessData[];
    unchanged: AccessData[];
    removed: DocKey[];
};

@Injectable()
export class TokenService {
    private tokenConnections: Map<string, WebSocketConnection[]> = new Map();

    constructor(private readonly pubsub: PubsubService) {
        this.pubsub.subscribe(updateTokenBroadcastMessageType, this.onUpdateTokenMessage);
    }

    addConnection(conn: WebSocketConnection) {
        const tokenId = conn.tokenId;
        let connections = this.tokenConnections.get(tokenId);

        if (connections) {
            connections.push(conn);
        } else {
            connections = [conn];
        }

        this.tokenConnections.set(tokenId, connections);
    }

    removeConnection(conn: WebSocketConnection) {
        this.tokenConnections.delete(conn.tokenId);
    }

    private onUpdateTokenMessage = (message: UpdateTokenBroadcastMessage) => {
        const tokenData = message.message.data;
        const oldTokenId = message.message.data.oldTokenId;
        const tokenId = tokenData.tokenId;

        const connections = this.tokenConnections.get(oldTokenId);

        if (!connections) {
            return;
        }

        const newConnAccess = createAccessObject(tokenData.docs);

        const tokenRightsDiff = this.getTokenRightsDiff(connections[0].access, newConnAccess);

        for (const conn of connections) {
            conn.access = newConnAccess;

            // Send message to detach connection from documents
            // so the connection doesn't get new changes
            if (tokenRightsDiff.removed) {
                const detachMessage: DetachDocBroadcastMessage = {
                    type: 'detachDoc',
                    message: {
                        docs: tokenRightsDiff.removed,
                        connectionId: conn.id,
                    },
                };
                this.pubsub.publishInternal(detachMessage);
            }

            // Send message to attach connection to documents
            // so the connection gets new changes
            if (tokenRightsDiff.added) {
                const attachMessage: AttachDocBroadcastMessage = {
                    type: 'attachDoc',
                    message: {
                        docs: tokenRightsDiff.added.map((doc) => doc.id),
                        connection: conn,
                    },
                };

                this.pubsub.publishInternal(attachMessage);
            }

            // Send message to client with new token
            const updateTokenMessage: UpdateTokenServiceEvent = {
                event: 'service',
                data: {
                    event: 'updateToken',
                    data: {
                        token: message.message.token,
                        docs: {
                            added: tokenRightsDiff.added,
                            changed: tokenRightsDiff.changed,
                            unchanged: tokenRightsDiff.unchanged,
                            removed: tokenRightsDiff.removed,
                        },
                    },
                },
            };

            conn.send(JSON.stringify(updateTokenMessage));
        }

        // Update token id
        this.tokenConnections.delete(oldTokenId);
        this.tokenConnections.set(tokenId, connections);
    };

    private getTokenRightsDiff(
        rights: WebSocketConnection['access'],
        newRights: WebSocketConnection['access']
    ): TokenRightsDiff {
        const added = [];
        const changed = [];
        const unchanged = [];
        const removed = [];

        const docIds = new Set<string>(Object.keys(rights).concat(Object.keys(newRights)));

        for (const id of docIds) {
            const isInDocs = id in rights;
            const isInNewDocs = id in newRights;

            if (isInDocs && isInNewDocs) {
                if (rights[id].rights === newRights[id].rights) {
                    unchanged.push(newRights[id]);
                } else if (newRights[id].rights.length === 0) {
                    removed.push(id);
                } else if (rights[id].rights.length === 0) {
                    added.push(newRights[id]);
                } else {
                    changed.push(newRights[id]);
                }

                continue;
            }

            if (isInDocs) {
                removed.push(rights[id]);
                continue;
            }

            if (isInNewDocs) {
                added.push(newRights[id]);
            }
        }

        return {
            added,
            changed,
            unchanged,
            removed,
        };
    }
}
