import { UpdateJWTPaload, UpdateTokenMessage } from '@a-la-fois/api';
import { Injectable } from '@nestjs/common';
import { DocKey } from 'src/doc/types';
import { UpdateTokenServiceMessage } from 'src/messages';
import { PubsubService } from 'src/pubsub/pubsub.service';
import { UpdateTokenBroadcastMessage, updateTokenBroadcastMessageType } from 'src/pubsub/types';
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
        const tokenId = message.message.data.id;
        const tokenData = message.message.data;
        const connections = this.tokenConnections.get(tokenId);

        if (!connections) {
            return;
        }

        const tokenRightsDiff = this.getTokenRightsDiff(connections[0].access, tokenData.docs);

        for (const conn of connections) {
            conn.access = createAccessObject(tokenData.docs);
            const updateTokenMessage: UpdateTokenServiceMessage = {
                event: 'updateToken',
                data: {
                    token: message.message.token,
                    docs: {
                        added: tokenRightsDiff.added,
                        changed: tokenRightsDiff.changed,
                        removed: tokenRightsDiff.removed,
                    },
                    message: 'Token is updated',
                },
            };

            conn.send(JSON.stringify(updateTokenMessage));
        }
    };

    private getTokenRightsDiff(
        rights: WebSocketConnection['access'],
        newRights: UpdateJWTPaload['docs']
    ): TokenRightsDiff {
        const added = [];
        const changed = [];
        const unchanged = [];
        const removed = [];

        const docIds = new Set<string>(Object.keys(rights).concat(Object.keys(newRights)));

        for (const id in docIds) {
            const isInDocs = id in rights;
            const isInNewDocs = id in newRights;

            if (isInDocs && isInNewDocs) {
                if (rights[id].rights === newRights[id].rights) {
                    unchanged.push(newRights[id]);
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
