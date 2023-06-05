import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DocKey } from 'src/doc/types';
import { TokenExpiredServiceMessage, UpdateTokenServiceMessage } from 'src/messages';
import { AccessData, WebSocketConnection } from 'src/ws/types';
import { createAccessObject } from './utils';
import { config } from '../config';
import { WS_CLOSE_STATUS_NORMAL } from 'src/ws/constants';
import {
    AttachDocPubsubMessage,
    DetachDocPubsubMessage,
    DisconnectPubsubMessage,
    Pubsub,
    PubsubDecorator,
    updateTokenMessageType,
    UpdateTokenPubsubMessage,
} from '@a-la-fois/pubsub';

type TokenRightsDiff = {
    added: AccessData[];
    changed: AccessData[];
    unchanged: AccessData[];
    removed: DocKey[];
};
@Injectable()
export class TokenService implements OnModuleDestroy {
    private tokenConnections: Map<string, WebSocketConnection[]> = new Map();
    private expirationInterval: NodeJS.Timer;

    constructor(@PubsubDecorator() private readonly pubsub: Pubsub) {
        this.pubsub.subscribe<typeof updateTokenMessageType>(updateTokenMessageType, this.onUpdateTokenMessage);
        this.expirationInterval = setInterval(this.checkTokenExpiration, parseInt(config.auth.expiredCheckIntervalMs));
    }
    onModuleDestroy() {
        clearInterval(this.expirationInterval);
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
        const connections = this.tokenConnections.get(conn.tokenId);

        if (!connections) {
            return;
        }

        const index = connections.indexOf(conn);

        // Delete connection
        if (index != -1) {
            connections.splice(index, 1);
        }

        // Delete a record if there is no connections with this tokenId
        if (connections.length === 0) {
            this.tokenConnections.delete(conn.tokenId);
        }
    }

    private onUpdateTokenMessage = (message: UpdateTokenPubsubMessage) => {
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
                } as DetachDocPubsubMessage);
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
                } as AttachDocPubsubMessage);
            }

            // Send message to client with new token
            const updateTokenMessage: UpdateTokenServiceMessage = {
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

            if (!conn.tokenExpiredAt || conn.tokenExpiredAt > new Date()) {
                continue;
            }

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

                // Send message to disconnect from docService
                this.pubsub.publishInternal({
                    type: 'disconnect',
                    message: {
                        connectionId: conn.id,
                    },
                } as DisconnectPubsubMessage);

                // ws.gateway calls removeConnection() on conn.close()
                // call removeConnection() for more clarity
                conn.close(WS_CLOSE_STATUS_NORMAL);
                this.removeConnection(conn);
            }
        }
    };
}
