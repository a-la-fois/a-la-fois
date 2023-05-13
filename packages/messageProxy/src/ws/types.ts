import { Right, JWTPayload } from '@a-la-fois/api';

export type AccessData = {
    id: string;
    rights: Right[];
    isPublic?: boolean;
};

export type WebSocketClient = {
    id: string;
    userId: string;
    consumerId: string;
    access: Record<string, AccessData>;
} & WebSocket;

export type ClientJWTPayload = JWTPayload & {
    // unique for every connection
    clientId: string;

    // unique for every user
    // One user can have multiple connections
    userId: string;

    consumerId: string;
};
