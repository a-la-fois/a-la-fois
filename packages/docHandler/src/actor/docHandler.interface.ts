import {
    ApplyDiffRequest,
    ApplyDiffResponse,
    SyncCompleteRequest,
    SyncStartRequest,
    SyncStartResponse,
} from '../messages';

export interface IDocHandler {
    applyDiff(changes: ApplyDiffRequest): Promise<ApplyDiffResponse>;

    syncStart(vector: SyncStartRequest): Promise<SyncStartResponse>;

    syncComplete(message: SyncCompleteRequest): Promise<void>;
}
