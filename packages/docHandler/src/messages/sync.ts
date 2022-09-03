import { Changes } from './changes';

export type StateVector = string;

export type SyncResponseActorType = {
    vector: StateVector;
    changes: Changes;
};

export type SyncCompleteActorType = {
    changes: Changes;
};
