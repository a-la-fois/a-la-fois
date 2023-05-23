import { Response } from './common';

export type CheckClientTokenRequest = {
    jwt: string;
};

export type CheckClientTokenResponse<TJWTPayload extends JWTPayload = JWTPayload> = Response<TJWTPayload>;

export type JWTPayload = {
    tokenId: string;
    consumerId: string;
    userId: string;
    expiredAt?: Date;
    docs?: {
        id: string;
        rights: Right[];
    }[];
};

export type Right = 'read' | 'write';
