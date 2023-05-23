import { EventEmitter } from 'eventemitter3';
import { WsConnection } from './WsConnection';
import {
    JoinPayload,
    joinEvent,
    joinResponseEvent,
    JoinResponsePayload,
    ChangesPayload,
    changesEvent,
    BroadcastChangesPayload,
    broadcastChangesEvent,
    PingMessage,
    pingEvent,
    SyncStartPayload,
    syncStartEvent,
    SyncStartMessage,
    SyncResponsePayload,
    syncResponseEvent,
    SyncCompletePayload,
    syncCompleteEvent,
    SyncCompleteMessage,
    BroadcastAwarenessPayload,
    broadcastAwarenessEvent,
    awarenessEvent,
    AwarenessPayload,
    serviceEvent,
    PossibleServiceEvents,
} from '@a-la-fois/message-proxy';

export type MessengerConfig = {
    connection: WsConnection;
};

export interface Messenger {
    once(event: typeof joinResponseEvent, listener: (payload: JoinResponsePayload) => void): this;
    once(event: typeof syncResponseEvent, listener: (payload: SyncResponsePayload) => void): this;
    once(event: typeof broadcastChangesEvent, listener: (payload: BroadcastChangesPayload) => void): this;
    once(event: typeof broadcastAwarenessEvent, listener: (payload: BroadcastAwarenessPayload) => void): this;
    once(event: typeof serviceEvent, listener: (payload: PossibleServiceEvents) => void): this;

    on(event: typeof joinResponseEvent, listener: (payload: JoinResponsePayload) => void): this;
    on(event: typeof syncResponseEvent, listener: (payload: SyncResponsePayload) => void): this;
    on(event: typeof broadcastChangesEvent, listener: (payload: BroadcastChangesPayload) => void): this;
    on(event: typeof broadcastAwarenessEvent, listener: (payload: BroadcastAwarenessPayload) => void): this;
    on(event: typeof serviceEvent, listener: (payload: PossibleServiceEvents) => void): this;

    off(event: typeof joinResponseEvent, listener: (payload: JoinResponsePayload) => void): this;
    off(event: typeof syncResponseEvent, listener: (payload: SyncResponsePayload) => void): this;
    off(event: typeof broadcastChangesEvent, listener: (payload: BroadcastChangesPayload) => void): this;
    off(event: typeof broadcastAwarenessEvent, listener: (payload: BroadcastAwarenessPayload) => void): this;
    off(event: typeof serviceEvent, listener: (payload: PossibleServiceEvents) => void): this;

    emit(event: typeof joinResponseEvent, payload: JoinResponsePayload): boolean;
    emit(event: typeof syncResponseEvent, payload: SyncResponsePayload): boolean;
    emit(event: typeof broadcastChangesEvent, payload: BroadcastChangesPayload): boolean;
    emit(event: typeof broadcastAwarenessEvent, payload: BroadcastAwarenessPayload): boolean;
    emit(event: typeof serviceEvent, payload: PossibleServiceEvents): boolean;
}

export class Messenger extends EventEmitter {
    private readonly connection: WsConnection;

    constructor({ connection }: MessengerConfig) {
        super();
        this.connection = connection;
        this.connection.on('message', this.handleMessage);
    }

    dispose() {
        this.connection.off('message', this.handleMessage);
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

    private handleMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        const messageEvent = message.event;

        switch (messageEvent) {
            case joinResponseEvent:
                this.emit(joinResponseEvent, message.data);
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
            case serviceEvent:
                this.emit(serviceEvent, message.data);
                break;
        }
    };
}
