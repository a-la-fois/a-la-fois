import { ApplyDiffRequest, SyncCompleteRequest, SyncStartRequest, SyncStartResponse } from '../messages';

export interface IDocHandler {
    applyDiff(changes: ApplyDiffRequest): Promise<void>;

    syncStart(vector: SyncStartRequest): Promise<SyncStartResponse>;

    syncComplete(message: SyncCompleteRequest): Promise<void>;
}
