import { Message } from './message';

export interface JoinPayload {
    docId: string;
}

export const joinEvent = 'join';

export type JoinMessage = Message<typeof joinEvent, JoinPayload>;
