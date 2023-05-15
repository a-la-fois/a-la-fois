import { Response } from './common';

export type CheckClientTokenRequest = {
    jwt: string;
};

export type CheckClientTokenResponse<TJWTPayload extends JWTPayload = JWTPayload> = Response<TJWTPayload>;

export type JWTPayload = {
    consumerId: string;
    userId: string;
    expiredAt?: Date;
    docs?: {
        id: string;
        rights: Right[];
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
