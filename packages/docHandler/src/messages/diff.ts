import { Changes } from './common';

export type ApplyDiffRequest = {
    changes: Changes;
    userId: string;
};
