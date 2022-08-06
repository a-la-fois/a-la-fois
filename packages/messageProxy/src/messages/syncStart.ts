import { Message } from './message';
import { Vector } from './types';

export type SyncStartPayload = {
    docId: string;
    vector: Vector;
};

export const syncStartEvent = 'syncStart';

export type SyncStartMessage = Message<typeof syncStartEvent, SyncStartPayload>;
