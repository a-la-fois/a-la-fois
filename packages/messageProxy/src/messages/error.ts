import { Message } from './message';

export type ErrorPayload = {
    docId?: string;
    message: string;
};

export const errorEvent = 'error';

export type ErrorMessage = Message<typeof errorEvent, ErrorPayload>;

export const baseErrorMessage: Message<typeof errorEvent, ErrorPayload> = {
    event: errorEvent,
    data: {
        message: 'Internal server error',
    },
};
