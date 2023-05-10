import { Response } from './common';

export type CheckClientTokenRequest = {
    jwt: string;
};

export type CheckClientTokenResponse<TJWTPayload extends JWTPayload = JWTPayload> = Response<TJWTPayload>;

export type JWTPayload = {
    consumerId: string;
    userId: string;
    expiredAt?: number; // unix time
    docs?: {
        id: string;
        rights: Right[];
    }[];
};

export type Right = 'read' | 'write' | 'noAccess';
