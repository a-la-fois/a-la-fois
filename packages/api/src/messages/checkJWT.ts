import { Response } from './common';

export type CheckJWTRequest = {
    jwt: string;
};

export type CheckJWTResponse<TJWTPayload extends JWTPayload = JWTPayload> = Response<TJWTPayload>;

export type JWTPayload = {
    consumerId: string;
};
