import { Message } from './message';

export interface SetTokenResponsePayload {
    status: 'ok' | 'err';
    message?: string;
}

export const setTokenResponseEvent = 'setTokenResponse';

export type SetTokenResponseMessage = Message<typeof setTokenResponseEvent, SetTokenResponsePayload>;

export const setTokenResponse = (payload: SetTokenResponsePayload): SetTokenResponseMessage => ({
    event: setTokenResponseEvent,
    data: payload,
});
