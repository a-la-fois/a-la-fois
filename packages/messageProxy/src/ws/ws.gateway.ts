import { URL } from 'node:url';
import { AuthClient } from '@a-la-fois/api';
import { IncomingMessage } from 'http';
import { DaprClient } from '@dapr/dapr';
import { v4 as uuid } from 'uuid';
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { DaprClient as DaprClientDecorator } from '@a-la-fois/nest-common';
import {
    joinEvent,
    JoinPayload,
    changesEvent,
    ChangesPayload,
    closeEvent,
    ClosePayload,
    pingEvent,
    PongMessage,
    pongEvent,
    SyncStartPayload,
    syncStartEvent,
    SyncResponseMessage,
    syncResponseEvent,
    SyncCompletePayload,
    syncCompleteEvent,
    JoinResponseMessage,
    joinResponseEvent,
    ConnectResponseMessage,
} from '../messages';
import { DocService } from '../doc/doc.service';
import { ClientJWTPayload, WebSocketClient } from './types';

@WebSocketGateway()
export class WsGateway implements OnGatewayConnection {
    private authClient: AuthClient;

    constructor(private readonly docService: DocService, @DaprClientDecorator() private daprClient: DaprClient) {
        this.authClient = new AuthClient(daprClient);
    }

    handleConnection(client: WebSocketClient, context: IncomingMessage) {
        const url = new URL(context.url, 'http://localhost');
        const token = url.searchParams.get('token');

        if (!token) {
            const message: ConnectResponseMessage = {
                event: 'connectResponse',
                data: {
                    status: 'ok',
                },
            };

            client.send(JSON.stringify(message));
            client.id = uuid();
            client.access = {};

            return;
        }

        this.authClient.checkClientToken<ClientJWTPayload>(token).then((res) => {
            if (res.status !== 200) {
                const errorMessage: ConnectResponseMessage = {
                    event: 'connectResponse',
                    data: {
                        status: 'err',
                        message: 'invalid token',
                    },
                };

                client.send(JSON.stringify(errorMessage));
                return client.close();
            }

            const successMessage: ConnectResponseMessage = {
                event: 'connectResponse',
                data: {
                    status: 'ok',
                },
            };

            client.send(JSON.stringify(successMessage));
            client.id = res.payload.clientId;
            client.access =
                res.payload.docs?.reduce((acc, doc) => {
                    acc[doc.id] = {
                        id: doc.id,
                        rights: doc.rights,
                    };

                    return acc;
                }, {} as WebSocketClient['access']) ?? {};
        });
    }

    @SubscribeMessage(joinEvent)
    async onJoin(client: WebSocketClient, { docId }: JoinPayload): Promise<JoinResponseMessage> {
        if (!client.access[docId]) {
            const response = await this.authClient.docIsPublic(docId);

            if (response.status !== 200) {
                return {
                    event: joinResponseEvent,
                    data: {
                        docId,
                        status: 'err',
                        message: 'Internal error',
                    },
                };
            }

            if (!response.payload.isPublic) {
                return {
                    event: joinResponseEvent,
                    data: {
                        docId,
                        status: 'err',
                        message: 'Unauthorized',
                    },
                };
            }
        }

        const data = this.docService.joinToDoc(client, docId);
        const message: JoinResponseMessage = {
            event: joinResponseEvent,
            data,
        };

        return message;
    }

    @SubscribeMessage(changesEvent)
    async onChanges(client: WebSocketClient, payload: ChangesPayload) {
        this.docService.applyDiff(client, payload);
    }

    @SubscribeMessage(syncStartEvent)
    async onSyncStart(client: WebSocketClient, payload: SyncStartPayload) {
        const data = await this.docService.syncStart(client, payload);
        const message: SyncResponseMessage = {
            event: syncResponseEvent,
            data,
        };

        return message;
    }

    @SubscribeMessage(syncCompleteEvent)
    async onSyncComplete(client: WebSocketClient, payload: SyncCompletePayload) {
        this.docService.syncComplete(client, payload);
    }

    @SubscribeMessage(closeEvent)
    async onClose(client: WebSocketClient, payload: ClosePayload) {
        // TODO
    }

    @SubscribeMessage(pingEvent)
    async ping(client: WebSocketClient): Promise<PongMessage> {
        return {
            event: pongEvent,
        };
    }
}
