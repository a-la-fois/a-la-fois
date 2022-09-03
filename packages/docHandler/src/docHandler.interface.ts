import { Changes, SyncCompletePayload, SyncResponsePayload, SyncStartPayload } from './messages';

export interface IDocHandler {
    applyDiff(changes: Changes): Promise<void>;

    syncStart({ vector }: SyncStartPayload): Promise<SyncResponsePayload>;

    syncComplete({ changes }: SyncCompletePayload): Promise<void>;
}
