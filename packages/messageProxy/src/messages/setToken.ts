import { Message } from './message';

export type SetTokenPayload = {
    token: string;
};

export const setTokenEvent = 'setTokenEvent';

export type SetTokenMessage = Message<typeof setTokenEvent, SetTokenPayload>;
