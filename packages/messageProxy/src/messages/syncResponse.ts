import { Message } from './message';
import { Changes, Vector } from './types';

export type SyncResponsePayload = {
    docId: string;
    vector: Vector;
    changes: Changes;
};

export const syncResponseEvent = 'syncResponse';

export type SyncResponseMessage = Message<typeof syncResponseEvent, SyncResponsePayload>;
