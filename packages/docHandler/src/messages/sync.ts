export type SyncStartPayload = {
    vector: string;
};

export type SyncResponsePayload = {
    vector: string;
    changes: string;
};

export type SyncCompletePayload = {
    changes: string;
};
