import { JWTPayload } from './checkClientToken';

export type UpdateTokenMessage = {
    token: string;
    payload: JWTPayload;
};
