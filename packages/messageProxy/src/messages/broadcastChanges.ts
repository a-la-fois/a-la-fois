import { Changes } from './types';
import { Message } from './message';

export type BroadcastChangesPayload = {
    docId: string;
    changes: Changes;
};

export const broadcastChangesEvent = 'broadcastChanges';

export type BroadcastChangesMessage = Message<typeof broadcastChangesEvent, BroadcastChangesPayload>;
