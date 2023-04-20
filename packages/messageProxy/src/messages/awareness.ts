import { Message } from './message';
import { Awareness } from './types';

export type AwarenessPayload = {
    docId: string;
    awareness: Awareness;
};

export const awarenessEvent = 'awareness';

export type AwarenessMessage = Message<typeof awarenessEvent, AwarenessPayload>;
