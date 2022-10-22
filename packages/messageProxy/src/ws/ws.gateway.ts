import { OnGatewayConnection, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { v4 as uuidv4 } from 'uuid';

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

@WebSocketGateway()
export class WsGateway implements OnGatewayConnection {
    constructor(private readonly docService: DocService) {}

    handleConnection(client: any, context: IncomingMessage) {
        client.id = uuidv4();
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
