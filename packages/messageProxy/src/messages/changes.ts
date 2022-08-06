import { Changes } from './types';
import { Message } from './message';

export type ChangesPayload = {
    docId: string;
    changes: Changes;
};

export const changesEvent = 'changes';

export type ChangesMessage = Message<typeof changesEvent, ChangesPayload>;
