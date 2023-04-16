import { Message } from './message';

export interface ConnectResponsePayload {
    status: 'ok' | 'err';
    message?: string;
}

export const connectResponseEvent = 'connectResponse';

export type ConnectResponseMessage = Message<typeof connectResponseEvent, ConnectResponsePayload>;
