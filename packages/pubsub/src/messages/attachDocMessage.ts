import { PubsubMessage } from './pubsubMessage';

export const attachDocMessageType = 'attachDoc';

type AccessDataPayload = {
    id: string;
    rights: ('read' | 'write')[];
};

export type AttachDocPayload = {
    docs: string[];
    connection: {
        id: string;
        tokenId: string;
        tokenExpiredAt: Date;
        userId: string;
        consumerId: string;
        access: Record<string, AccessDataPayload>;
    } & WebSocket;
};

export type AttachDocPubsubMessage = PubsubMessage<typeof attachDocMessageType, AttachDocPayload>;
