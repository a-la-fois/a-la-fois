import { Message } from './message';

export type RequestSyncPayload = {
    syncNeeded: boolean;
};

export const requestSyncEvent = 'requestSync';

export type RequestSyncMessage = Message<typeof requestSyncEvent, RequestSyncPayload>;

export const requestSync = (payload: RequestSyncPayload): RequestSyncMessage => ({
    event: requestSyncEvent,
    data: payload,
});
