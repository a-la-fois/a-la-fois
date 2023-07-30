import { LoggerService } from '@a-la-fois/nest-common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { URL } from 'node:url';
import { AuthService } from '../auth/auth.service';
import { DocService } from '../doc/doc.service';
import { MessageError } from '../errors';
import {
    ChangesPayload,
    JoinPayload,
    JoinResponseMessage,
    PongMessage,
    SetTokenPayload,
    SyncCompletePayload,
    SyncStartPayload,
    baseErrorMessage,
    changesEvent,
    connectResponse,
    error,
    joinEvent,
    joinResponse,
    pingEvent,
    pong,
    setTokenEvent,
    setTokenResponse,
    syncCompleteEvent,
    syncResponse,
    syncStartEvent,
} from '../messages';
import { AwarenessPayload, awarenessEvent } from '../messages/awareness';
import { WebSocketConnection } from './types';

@WebSocketGateway()
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly docService: DocService,
        private readonly authService: AuthService,
        private readonly loggerService: LoggerService
    ) {}

    async handleConnection(client: WebSocketConnection, context: IncomingMessage) {
        this.loggerService.info({}, 'New connection');
        const url = new URL(context.url, 'http://localhost');
        const token = url.searchParams.get('token');

        const clientInitResult = await this.authService.initClient(client, token);

        if (clientInitResult.status === 'ok') {
            return client.send(JSON.stringify(connectResponse({ status: 'ok' })));
        }

        client.send(JSON.stringify(connectResponse({ status: 'err', message: clientInitResult.message })));
    }

    handleDisconnect(client: WebSocketConnection) {
        this.docService.disconnect(client.id);
        this.authService.disconnect(client);
    }

    @SubscribeMessage(joinEvent)
    async onJoin(client: WebSocketConnection, { docId }: JoinPayload): Promise<JoinResponseMessage> {
        const docRightCheckResult = await this.authService.checkDocAccess(client, docId);

        if (docRightCheckResult.status == 'err') {
            return joinResponse({
                status: 'err',
                docId,
                message: docRightCheckResult.message,
            });
        }

        const data = this.docService.joinToDoc(client, docId);

        return joinResponse(data);
    }

    @SubscribeMessage(setTokenEvent)
    async onSetToken(client: WebSocketConnection, payload: SetTokenPayload) {
        const result = await this.authService.applyToken(client, payload.token);

        if (result.status === 'err') {
            return setTokenResponse({ status: 'err', message: result.message });
        }

        this.docService.disconnect(client.id);

        return setTokenResponse({ status: 'ok' });
    }

    @SubscribeMessage(changesEvent)
    async onChanges(client: WebSocketConnection, payload: ChangesPayload) {
        const rightCheckResult = this.authService.checkWriteAccess(client, payload.docId);

        if (rightCheckResult.status === 'err') {
            return error({
                docId: payload.docId,
                message: rightCheckResult.message,
            });
        }

        try {
            this.docService.applyChanges(client, payload);
        } catch (err) {
            if (err instanceof MessageError) {
                return err.toMessage();
            } else {
                return baseErrorMessage;
            }
        }
    }

    @SubscribeMessage(syncStartEvent)
    async onSyncStart(client: WebSocketConnection, payload: SyncStartPayload) {
        const rightCheckResult = this.authService.checkReadAccess(client, payload.docId);

        if (rightCheckResult.status === 'err') {
            return error({
                docId: payload.docId,
                message: rightCheckResult.message,
            });
        }

        const data = await this.docService.syncStart(client, payload);

        return syncResponse(data);
    }

    @SubscribeMessage(syncCompleteEvent)
    async onSyncComplete(client: WebSocketConnection, payload: SyncCompletePayload) {
        const rightCheckResult = this.authService.checkWriteAccess(client, payload.docId);

        if (rightCheckResult.status == 'err') {
            return error({
                docId: payload.docId,
                message: rightCheckResult.message,
            });
        }

        this.docService.syncComplete(client, payload);
    }

    @SubscribeMessage(awarenessEvent)
    async onAwareness(client: WebSocketConnection, payload: AwarenessPayload) {
        try {
            this.docService.applyAwareness(client, payload);
        } catch (err) {
            if (err instanceof MessageError) {
                return err.toMessage();
            } else {
                return baseErrorMessage;
            }
        }
    }

    @SubscribeMessage(pingEvent)
    async ping(): Promise<PongMessage> {
        return pong();
    }
}
