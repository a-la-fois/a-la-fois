import { Right } from '@a-la-fois/api';

export type AccessData = {
    id: string;
    rights: Right[];
};

export type WebSocketConnection = {
    id: string;
    tokenId: string;
    userId: string;
    consumerId: string;
    access: Record<string, AccessData>;
} & WebSocket;

export type ConnectionId = WebSocketConnection['id'];
