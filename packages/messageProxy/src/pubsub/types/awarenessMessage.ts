import { BroadcastMessage } from './broadcastMessage';

export const awarenessBroadcastMessageType = 'awareness';

export type AwarenessBroadcastPayload = {
    author: string;
    docId: string;
    data: string;
};

export type AwarenessBroadcastMessage = BroadcastMessage<
    typeof awarenessBroadcastMessageType,
    AwarenessBroadcastPayload
>;
