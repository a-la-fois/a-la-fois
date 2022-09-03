import { Changes, StateVector, SyncCompleteActorType, SyncResponseActorType } from '../messages';

export interface IDocHandler {
    applyDiff(changes: Changes): Promise<void>;

    syncStart(vector: StateVector): Promise<SyncResponseActorType>;

    syncComplete({ changes }: SyncCompleteActorType): Promise<void>;
}
