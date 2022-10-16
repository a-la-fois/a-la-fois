import { Message } from './message';

export const JoinResponseStatus = {
    ok: 'ok',
    err: 'err',
};

export interface JoinResponsePayload {
    docId: string;
    status: string;
    message?: string;
}

export const joinResponseEvent = 'joinResponse';

export type JoinResponseMessage = Message<typeof joinResponseEvent, JoinResponsePayload>;
