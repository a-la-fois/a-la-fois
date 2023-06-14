import { PubsubMessage } from './pubsubMessage';

export const changesMessageType = 'changes';

export type ChangesPayload = {
    author: string;
    docId: string;
    data: string;
};

export type ChangesPubsubMessage = PubsubMessage<typeof changesMessageType, ChangesPayload>;
