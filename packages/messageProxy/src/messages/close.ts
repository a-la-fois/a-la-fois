import { Message } from './message';

export type ClosePayload = {
    roomId: string;
};

export const closeEvent = 'close';

export type CloseMessage = Message<typeof closeEvent, ClosePayload>;
