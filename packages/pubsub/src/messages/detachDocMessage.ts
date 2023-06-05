import { PubsubMessage } from './pubsubMessage';

export const detachDocMessageType = 'detachDoc';

export type DetachDocPayload = {
    docs: string[];
    connectionId: string;
};

export type DetachDocPubsubMessage = PubsubMessage<typeof detachDocMessageType, DetachDocPayload>;
