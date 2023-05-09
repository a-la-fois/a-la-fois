import { Message } from './message';

export type DisconnectPayload = {
    docs: string[];
};

export const disconnectEvent = 'dissconnect';

export type DisconnectMessage = Message<typeof disconnectEvent, DisconnectPayload>;
