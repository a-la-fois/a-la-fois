import { Injectable } from '@nestjs/common';
import { DocKey } from 'src/doc/types';
import { TokenExpiredServiceMessage, UpdateTokenServiceEvent } from 'src/messages';
import { PubsubService } from 'src/pubsub/pubsub.service';
import {
    DetachDocBroadcastMessage,
    UpdateTokenBroadcastMessage,
    updateTokenBroadcastMessageType,
} from 'src/pubsub/types';
import { AttachDocBroadcastMessage } from 'src/pubsub/types/attachDocMessage';
import { AccessData, WebSocketConnection } from 'src/ws/types';
import { createAccessObject, docIdsFromAccess } from './utils';

type TokenRightsDiff = {
    added: AccessData[];
    changed: AccessData[];
    unchanged: AccessData[];
    removed: DocKey[];
};

const EXPIRATION_CHECK_INTERVAL = 5_000; // 5 minutes

@Injectable()
export class TokenService {
    private tokenConnections: Map<string, WebSocketConnection[]> = new Map();
    private expirationInterval: NodeJS.Timer;

    constructor(private readonly pubsub: PubsubService) {
        this.pubsub.subscribe(updateTokenBroadcastMessageType, this.onUpdateTokenMessage);
        this.expirationInterval = setInterval(this.checkTokenExpiration, EXPIRATION_CHECK_INTERVAL);
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
                this.pubsub.publishInternal({
                    type: 'detachDoc',
                    message: {
                        docs: tokenRightsDiff.removed,
                        connectionId: conn.id,
                    },
                } as DetachDocBroadcastMessage);
            }

            // Send message to attach connection to documents
            // so the connection gets new changes
            if (tokenRightsDiff.added) {
                this.pubsub.publishInternal({
                    type: 'attachDoc',
                    message: {
                        docs: tokenRightsDiff.added.map((doc) => doc.id),
                        connection: conn,
                    },
                } as AttachDocBroadcastMessage);
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

    private checkTokenExpiration = () => {
        for (const [_tokenId, connections] of this.tokenConnections) {
            // Check only one because all connections with the same token
            // have the same expiration time
            const conn = connections[0];

            if (conn.tokenExpiredAt && conn.tokenExpiredAt < new Date()) {
                for (const conn of connections) {
                    // Send message about token expiration to the client
                    const message: TokenExpiredServiceMessage = {
                        event: 'service',
                        data: {
                            event: 'expiredToken',
                            data: {
                                tokenId: conn.tokenId,
                                expiredAt: conn.tokenExpiredAt.toJSON(),
                            },
                        },
                    };
                    conn.send(JSON.stringify(message));

                    // Send message to detach from docs
                    this.pubsub.publishInternal({
                        type: 'detachDoc',
                        message: {
                            docs: docIdsFromAccess(conn.access),
                            connectionId: conn.id,
                        },
                    } as DetachDocBroadcastMessage);
                }
            }
        }
    };
}
