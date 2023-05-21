import { BroadcastMessage } from './broadcastMessage';

export const changesBroadcastMessageType = 'changes';

export type ChangesBroadcastPayload = {
    author: string;
    docId: string;
    data: string;
};

export type ChangesBroadcastMessage = BroadcastMessage<typeof changesBroadcastMessageType, ChangesBroadcastPayload>;
