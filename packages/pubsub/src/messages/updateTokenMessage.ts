import { PubsubMessage } from './pubsubMessage';

export const updateTokenMessageType = 'updateToken';

// Copied from API JWTPayload as a contract between microservices
export type UpdateTokenPayload = {
    token: string;
    data: {
        tokenId: string;
        oldTokenId: string;
        consumerId: string;
        userId: string;
        expiredAt?: string;
        docs?: {
            id: string;
            rights: ('read' | 'write')[];
        }[];
    };
};

export type UpdateTokenPubsubMessage = PubsubMessage<typeof updateTokenMessageType, UpdateTokenPayload>;
