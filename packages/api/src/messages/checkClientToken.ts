import { Response } from './common';

export type CheckClientTokenRequest = {
    jwt: string;
};

export type CheckClientTokenResponse<TJWTPayload extends JWTPayload = JWTPayload> = Response<TJWTPayload>;

export type JWTPayload = {
    consumerId: string;
    expiredAt?: number; // unix time
    docs?: {
        id: string;
        rights: Right[];
        isPublic?: boolean;
    }[];
};

/*
 *  If there are several rights
 *  they will be applyied in such oreder:
 *      - noAccess
 *      - write
 *      - read
 */
export type Right = 'read' | 'write' | 'noAccess';
