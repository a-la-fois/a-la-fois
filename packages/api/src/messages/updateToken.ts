import { JWTPayload } from './checkClientToken';

export type UpdateJWTPayload = JWTPayload & {
    oldTokenId: string;
};
