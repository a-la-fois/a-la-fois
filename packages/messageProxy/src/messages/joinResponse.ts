import { Message } from './message';

export interface JoinResponsePayload {
    docId: string;
    status: 'ok' | 'err';
    message?: string;
}

export const joinResponseEvent = 'joinResponse';

export type JoinResponseMessage = Message<typeof joinResponseEvent, JoinResponsePayload>;

export const joinResponse = (payload: JoinResponsePayload): JoinResponseMessage => ({
    event: joinResponseEvent,
    data: payload,
});
