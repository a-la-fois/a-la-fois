import { Message } from './message';

export type ErrorPayload = {
    docId?: string;
    message: string;
};

export const errorEvent = 'error';

export type ErrorMessage = Message<typeof errorEvent, ErrorPayload>;

export const error = (payload: ErrorPayload): ErrorMessage => ({
    event: errorEvent,
    data: payload,
});

export const baseErrorMessage = error({
    message: 'Internal server error',
});
