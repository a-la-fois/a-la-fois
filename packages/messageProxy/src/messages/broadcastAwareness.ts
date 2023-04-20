import { Awareness } from './types';
import { Message } from './message';

export type BroadcastAwarenessPayload = {
    docId: string;
    awareness: Awareness;
};

export const broadcastAwarenessEvent = 'broadcastAwarenessEvent';

export type BroadcastAwarenessMessage = Message<typeof broadcastAwarenessEvent, BroadcastAwarenessPayload>;
