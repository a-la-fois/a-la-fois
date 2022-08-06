import { Message } from './message';
import { Changes } from './types';

export type SyncCompletePayload = {
    docId: string;
    changes: Changes;
};

export const syncCompleteEvent = 'syncComplete';

export type SyncCompleteMessage = Message<typeof syncCompleteEvent, SyncCompletePayload>;
