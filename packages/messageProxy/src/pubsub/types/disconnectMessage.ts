import { BroadcastMessage } from '@a-la-fois/api';

export const disconnectBroadcastMessageType = 'disconnect';

export type disconnectBroadcastPayload = {
    connectionId: string;
};

export type DisconnectBroadcastMessage = BroadcastMessage<
    typeof disconnectBroadcastMessageType,
    disconnectBroadcastPayload
>;
