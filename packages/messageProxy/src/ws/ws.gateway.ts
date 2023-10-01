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
import { DocKey } from 'src/doc/types';

const logInfo = (conn: WebSocketConnection, docId: DocKey = null, error: Error = null) => ({
    connId: conn.id,
    userId: conn.userId,
    tokenId: conn.tokenId,
    docId: docId,
    err: error,
});

@WebSocketGateway()
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private logger: LoggerService;

    constructor(
        private readonly docService: DocService,
        private readonly authService: AuthService,
        loggerService: LoggerService,
    ) {
        this.logger = loggerService.child({ module: this.constructor.name });
    }

    async handleConnection(conn: WebSocketConnection, context: IncomingMessage) {
        const url = new URL(context.url, 'http://localhost');
        const token = url.searchParams.get('token');

        const clientInitResult = await this.authService.initClient(conn, token);

        if (clientInitResult.status === 'ok') {
            this.logger.info(logInfo(conn), 'Connection established');
            return conn.send(JSON.stringify(connectResponse({ status: 'ok' })));
        }

        conn.send(JSON.stringify(connectResponse({ status: 'err', message: clientInitResult.message })));

        this.logger.warn(
            { clientId: conn.id, userId: conn.userId, tokenId: conn.tokenId },
            `Connection failed: ${clientInitResult.message}`,
        );
    }

    handleDisconnect(conn: WebSocketConnection) {
        this.docService.disconnect(conn.id);
        this.authService.disconnect(conn);
        this.logger.info(logInfo(conn), 'Connection closed');
    }

    @SubscribeMessage(joinEvent)
    async onJoin(conn: WebSocketConnection, { docId }: JoinPayload): Promise<JoinResponseMessage> {
        const docRightCheckResult = await this.authService.checkDocAccess(conn, docId);

        if (docRightCheckResult.status == 'err') {
            this.logger.warn(logInfo(conn, docId), 'Access denied');
            return joinResponse({
                status: 'err',
                docId,
                message: docRightCheckResult.message,
            });
        }

        const data = this.docService.joinToDoc(conn, docId);

        this.logger.warn(logInfo(conn, docId), 'Access granted');
        return joinResponse(data);
    }

    @SubscribeMessage(setTokenEvent)
    async onSetToken(conn: WebSocketConnection, payload: SetTokenPayload) {
        const result = await this.authService.applyToken(conn, payload.token);

        if (result.status === 'err') {
            this.logger.warn(logInfo(conn), `Set token failed: ${result.message}`);
            return setTokenResponse({ status: 'err', message: result.message });
        }

        this.docService.disconnect(conn.id);

        this.logger.debug(logInfo(conn), 'Set token success');
        return setTokenResponse({ status: 'ok' });
    }

    @SubscribeMessage(changesEvent)
    async onChanges(conn: WebSocketConnection, payload: ChangesPayload) {
        const rightCheckResult = this.authService.checkWriteAccess(conn, payload.docId);

        if (rightCheckResult.status === 'err') {
            this.logger.warn(logInfo(conn, payload.docId), 'No write access');
            return error({
                docId: payload.docId,
                message: rightCheckResult.message,
            });
        }

        try {
            this.docService.applyChanges(conn, payload);
            this.logger.debug(logInfo(conn, payload.docId), 'Changes applied');
        } catch (err) {
            this.logger.error(logInfo(conn, payload.docId, err), `Couldn't apply changes`);
            if (err instanceof MessageError) {
                return err.toMessage();
            } else {
                return baseErrorMessage;
            }
        }
    }

    @SubscribeMessage(syncStartEvent)
    async onSyncStart(conn: WebSocketConnection, payload: SyncStartPayload) {
        const rightCheckResult = this.authService.checkReadAccess(conn, payload.docId);

        if (rightCheckResult.status === 'err') {
            this.logger.warn(logInfo(conn, payload.docId), 'No read access for sync');
            return error({
                docId: payload.docId,
                message: rightCheckResult.message,
            });
        }

        const data = await this.docService.syncStart(conn, payload);
        this.logger.debug(logInfo(conn, payload.docId), 'Sync started successfully');

        return syncResponse(data);
    }

    @SubscribeMessage(syncCompleteEvent)
    async onSyncComplete(conn: WebSocketConnection, payload: SyncCompletePayload) {
        const rightCheckResult = this.authService.checkWriteAccess(conn, payload.docId);

        if (rightCheckResult.status == 'err') {
            this.logger.debug(logInfo(conn, payload.docId), 'No write access for sync');
            return error({
                docId: payload.docId,
                message: rightCheckResult.message,
            });
        }

        this.docService.syncComplete(conn, payload);
        this.logger.debug(logInfo(conn, payload.docId), 'Sync completed successfully');
    }

    @SubscribeMessage(awarenessEvent)
    async onAwareness(conn: WebSocketConnection, payload: AwarenessPayload) {
        try {
            this.docService.applyAwareness(conn, payload);
            this.logger.debug(logInfo(conn, payload.docId), 'Awareness sent successfully');
        } catch (err) {
            this.logger.error(logInfo(conn, payload.docId, err), 'Awareness failed');
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
