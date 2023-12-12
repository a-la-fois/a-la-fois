import { Changes } from './common';

export type ApplyDiffRequest = {
    changes: Changes;
    userId: string;
};

export type ApplyDiffResponse = {
    syncNeeded: boolean;
};
