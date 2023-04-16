import { Right, JWTPayload } from '@a-la-fois/api';

export type AccessData = {
    id: string;
    rights: Right[];
};

export type WebSocketClient = { id: string; access: Record<string, AccessData> } & WebSocket;

export type ClientJWTPayload = JWTPayload & {
    clientId: string;
};
