import { PubsubMessage } from './pubsubMessage';

export const disconnectMessageType = 'disconnect';

export type disconnectPayload = {
    connectionId: string;
};

export type DisconnectPubsubMessage = PubsubMessage<typeof disconnectMessageType, disconnectPayload>;
