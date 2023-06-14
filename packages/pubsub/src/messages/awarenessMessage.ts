import { PubsubMessage } from './pubsubMessage';

export const awarenessMessageType = 'awareness';

export type AwarenessPayload = {
    author: string;
    docId: string;
    data: string;
};

export type AwarenessPubsubMessage = PubsubMessage<typeof awarenessMessageType, AwarenessPayload>;
