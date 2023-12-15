import {
    AwarenessPayload,
    BroadcastAwarenessPayload,
    BroadcastChangesPayload,
    ChangesPayload,
    JoinPayload,
    JoinResponsePayload,
    PingMessage,
    PossibleServiceEvent,
    RequestSyncPayload,
    SetTokenMessage,
    SetTokenPayload,
    SetTokenResponsePayload,
    SyncCompleteMessage,
    SyncCompletePayload,
    SyncResponsePayload,
    SyncStartMessage,
    SyncStartPayload,
    awarenessEvent,
    broadcastAwarenessEvent,
    broadcastChangesEvent,
    changesEvent,
    joinEvent,
    joinResponseEvent,
    pingEvent,
    requestSyncEvent,
    serviceEvent,
    setTokenEvent,
    setTokenResponseEvent,
    syncCompleteEvent,
    syncResponseEvent,
    syncStartEvent,
} from '@a-la-fois/message-proxy';
import { EventEmitter } from 'eventemitter3';
import { WsConnection } from './WsConnection';

export type MessengerConfig = {
    connection: WsConnection;
};

type IncomeEvents = {
    [joinResponseEvent]: JoinResponsePayload;
    [requestSyncEvent]: RequestSyncPayload;
    [syncResponseEvent]: SyncResponsePayload;
    [broadcastChangesEvent]: BroadcastChangesPayload;
    [broadcastAwarenessEvent]: BroadcastAwarenessPayload;
    [setTokenResponseEvent]: SetTokenResponsePayload;
    [serviceEvent]: PossibleServiceEvent['data'];
};

type InternalEvents = {
    connected: null;
};

type MessengerEvents = IncomeEvents & InternalEvents;

type MessengerEventType = keyof MessengerEvents;

export class Messenger extends EventEmitter {
    private readonly connection: WsConnection;

    constructor({ connection }: MessengerConfig) {
        super();
        this.connection = connection;
        this.connection.on('message', this.handleMessage);
        this.connection.on('connect', this.onConnect);
    }

    private onConnect = () => {
        this.emit('connected', null);
    };

    dispose() {
        this.connection.off('message', this.handleMessage);
        this.connection.off('connect', this.onConnect);
    }

    sendJoin(payload: JoinPayload) {
        this.connection.sendJson({
            event: joinEvent,
            data: payload,
        });
    }

    sendChanges(payload: ChangesPayload) {
        this.connection.sendJson({
            event: changesEvent,
            data: payload,
        });
    }

    sendAwareness(payload: AwarenessPayload) {
        this.connection.sendJson({
            event: awarenessEvent,
            data: payload,
        });
    }

    sendSyncStart(payload: SyncStartPayload) {
        const syncStartMessage: SyncStartMessage = {
            event: syncStartEvent,
            data: payload,
        };

        this.connection.sendJson(syncStartMessage);
    }

    sendSyncComplete(payload: SyncCompletePayload) {
        const syncCompleteMessage: SyncCompleteMessage = {
            event: syncCompleteEvent,
            data: payload,
        };

        this.connection.sendJson(syncCompleteMessage);
    }

    sendPing() {
        const pingMessage: PingMessage = {
            event: pingEvent,
        };
        this.connection.sendJson(pingMessage);
    }

    sendSetToken(payload: SetTokenPayload) {
        const setToken: SetTokenMessage = {
            event: setTokenEvent,
            data: payload,
        };

        this.connection.sendJson(setToken);
    }

    // @ts-ignore
    on<TType extends MessengerEventType>(type: TType, listener: (payload: MessengerEvents[TType]) => void): this {
        return super.on(type, listener);
    }

    // @ts-ignore
    once<TType extends MessengerEventType>(type: TType, listener: (payload: MessengerEvents[TType]) => void): this {
        return super.once(type, listener);
    }

    // @ts-ignore
    off<TType extends MessengerEventType>(type: TType, listener: (payload: MessengerEvents[TType]) => void): this {
        return super.off(type, listener);
    }

    // @ts-ignore
    emit<TType extends MessengerEventType>(type: TType, payload: MessengerEvents[TType]): boolean {
        return super.emit(type, payload);
    }

    async waitFor<TType extends MessengerEventType>(
        type: TType,
        timeout: number = 5000,
    ): Promise<MessengerEvents[TType]> {
        return new Promise<MessengerEvents[TType]>((resolve, reject) => {
            const listener = (payload: MessengerEvents[TType]) => {
                clearTimeout(timeoutId);
                resolve(payload);
            };

            this.once(type, listener);

            const timeoutId = setTimeout(() => {
                this.off(type, listener);
                reject(new Error('Timeout'));
            }, timeout);
        });
    }

    private handleMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        const messageEvent = message.event;

        switch (messageEvent) {
            case joinResponseEvent:
                this.emit(joinResponseEvent, message.data);
                break;
            case requestSyncEvent:
                this.emit(requestSyncEvent, message.data);
                break;
            case broadcastChangesEvent:
                this.emit(broadcastChangesEvent, message.data);
                break;
            case syncResponseEvent:
                this.emit(syncResponseEvent, message.data);
                break;
            case broadcastAwarenessEvent:
                this.emit(broadcastAwarenessEvent, message.data);
                break;
            case setTokenResponseEvent:
                this.emit(setTokenResponseEvent, message.data);
                break;
            case serviceEvent:
                this.emit(serviceEvent, message.data);
                break;
        }
    };
}
