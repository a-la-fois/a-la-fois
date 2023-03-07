import { Changes, StateVector } from './common';

export type SyncStartRequest = {
    vector: StateVector;
};

export type SyncStartResponse = {
    vector: StateVector;
    changes: Changes;
};

export type SyncCompleteRequest = {
    changes: Changes;
    userId: string;
};
