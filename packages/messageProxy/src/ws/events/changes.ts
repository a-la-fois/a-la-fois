export type BroadcastChangesPayload = {
    __id?: string;
    changes: string;
};

export const broadcastChangesEvent = 'broadcastChanges';
