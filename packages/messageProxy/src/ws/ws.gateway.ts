import { URL } from 'node:url';
import { AuthClient } from '@a-la-fois/api';
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
} from '../messages';
import { DocService } from '../doc/doc.service';

import { WebSocketClient } from './types';
import { IncomingMessage } from 'http';
import { DaprClient } from '@dapr/dapr';

type ClientJWT = {
    clientId: string;
    consumerId: string;
};

@WebSocketGateway()
export class WsGateway implements OnGatewayConnection {
    private authClient: AuthClient;

    constructor(private readonly docService: DocService, @DaprClientDecorator() private daprClient: DaprClient) {
        this.authClient = new AuthClient(daprClient);
    }

    handleConnection(client: any, context: IncomingMessage) {
        const url = new URL(context.url, 'http://localhost');
        const token = url.searchParams.get('token');

        if (!token) {
            return client.close();
        }

        // Finish JWT checking
        this.authClient.checkJWT<ClientJWT>(token).then((res) => {
            if (res.status !== 200) {
                return client.close();
            }

            client.id = res.payload.clientId;
        });
    }

    @SubscribeMessage(joinEvent)
    async onJoin(client: WebSocketClient, { docId }: JoinPayload) {
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
