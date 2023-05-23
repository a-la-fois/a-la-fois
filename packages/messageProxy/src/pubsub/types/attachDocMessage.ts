import { WebSocketConnection } from 'src/ws/types';
import { BroadcastMessage } from './broadcastMessage';

export const attachDocBroadcastMessageType = 'attachDoc';

export type AttachDocBroadcastPayload = {
    docs: string[];
    connection: WebSocketConnection;
};

export type AttachDocBroadcastMessage = BroadcastMessage<
    typeof attachDocBroadcastMessageType,
    AttachDocBroadcastPayload
>;
