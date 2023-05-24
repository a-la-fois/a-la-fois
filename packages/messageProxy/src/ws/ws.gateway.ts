import { URL } from 'node:url';
import { IncomingMessage } from 'http';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import {
    joinEvent,
    JoinPayload,
    changesEvent,
    ChangesPayload,
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
    baseErrorMessage,
} from '../messages';
import { DocService } from '../doc/doc.service';
import { WebSocketConnection } from './types';
import { awarenessEvent, AwarenessPayload } from 'src/messages/awareness';
import { MessageError } from 'src/errors';
import { AuthCheckResult, AuthService } from 'src/auth/auth.service';

@WebSocketGateway()
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly docService: DocService, private readonly authServise: AuthService) {}

    async handleConnection(client: WebSocketConnection, context: IncomingMessage) {
        const url = new URL(context.url, 'http://localhost');
        const token = url.searchParams.get('token');

        const clientInitResult: AuthCheckResult = await this.authServise.initClient(client, token);

        if (clientInitResult.status == 'ok') {
            client.send(
                JSON.stringify({
                    event: 'connectResponse',
                    data: {
                        status: 'ok',
                    },
                })
            );
        }

        client.send(
            JSON.stringify({
                event: 'connectResponse',
                data: {
                    status: 'err',
                    message: clientInitResult.message,
                },
            })
        );
    }

    handleDisconnect(client: WebSocketConnection) {
        this.docService.disconnect(client.id);
        this.authServise.disconnect(client);
    }

    @SubscribeMessage(joinEvent)
    async onJoin(client: WebSocketConnection, { docId }: JoinPayload): Promise<JoinResponseMessage> {
        const docRightCheckResult = await this.authServise.checkDocAccess(client, docId);

        if (docRightCheckResult.status == 'err') {
            return {
                event: 'joinResponse',
                data: {
                    docId,
                    status: 'err',
                    message: docRightCheckResult.message,
                },
            };
        }

        const data = this.docService.joinToDoc(client, docId);
        const message: JoinResponseMessage = {
            event: joinResponseEvent,
            data,
        };

        return message;
    }

    @SubscribeMessage(changesEvent)
    async onChanges(client: WebSocketConnection, payload: ChangesPayload) {
        const rightCheckResult = this.authServise.checkWriteAccess(client, payload.docId);

        if (rightCheckResult.status === 'err') {
            return {
                event: 'error',
                data: {
                    docId: payload.docId,
                    message: rightCheckResult.message,
                },
            };
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
        const rightCheckResult = this.authServise.checkReadAccess(client, payload.docId);

        if (rightCheckResult.status == 'err') {
            return {
                event: 'error',
                data: {
                    docId: payload.docId,
                    message: rightCheckResult.message,
                },
            };
        }

        const data = await this.docService.syncStart(client, payload);
        const message: SyncResponseMessage = {
            event: syncResponseEvent,
            data,
        };

        return message;
    }

    @SubscribeMessage(syncCompleteEvent)
    async onSyncComplete(client: WebSocketConnection, payload: SyncCompletePayload) {
        const rightCheckResult = this.authServise.checkWriteAccess(client, payload.docId);

        if (rightCheckResult.status == 'err') {
            return {
                event: 'error',
                data: {
                    docId: payload.docId,
                    message: rightCheckResult.message,
                },
            };
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
    async ping(client: WebSocketConnection): Promise<PongMessage> {
        return {
            event: pongEvent,
        };
    }
}
