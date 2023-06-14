import { ServiceMessage } from './serviceMessage';

export type TokenExpiredPayload = {
    tokenId: string;
    expiredAt: string;
};

export const tokenExpiredServiceEvent = 'expiredToken';

export type TokenExpiredServiceMessage = ServiceMessage<typeof tokenExpiredServiceEvent, TokenExpiredPayload>;
