import { BroadcastMessage } from './broadcastMessage';

export const detachDocBroadcastMessageType = 'detachDoc';

export type DetachDocBroadcastPayload = {
    docs: string[];
    connectionId: string;
};

export type DetachDocBroadcastMessage = BroadcastMessage<
    typeof detachDocBroadcastMessageType,
    DetachDocBroadcastPayload
>;
