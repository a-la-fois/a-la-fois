import { AbstractActor } from '@dapr/dapr';
import { Doc } from '@a-la-fois/models';
import { applyUpdate, Doc as YDoc, encodeStateAsUpdate, encodeStateVector } from 'yjs';
import { fromUint8Array, toUint8Array } from 'js-base64';
import { DocModel } from '../models';
import { IDocHandler } from './docHandler.interface';
import { Changes, StateVector, SyncCompleteActorType, SyncResponseActorType } from '../messages';

export class DocHandler extends AbstractActor implements IDocHandler {
    private ydoc!: YDoc;

    private getId(): string {
        return this.getActorId().getId();
    }

    encodeStateAsUpdate(encodedTargetStateVector?: Uint8Array | undefined) {
        const state = encodeStateAsUpdate(this.ydoc, encodedTargetStateVector);

        return Buffer.from(state.buffer);
    }

    async onActivate(): Promise<void> {
        this.ydoc = new YDoc();
        const doc: Doc | null = await DocModel.findOne({ docId: this.getId() });

        if (doc) {
            applyUpdate(this.ydoc, doc.state);
        } else {
            await DocModel.create({
                docId: this.getId(),
                state: this.encodeStateAsUpdate(),
            });
        }
    }

    async applyDiff(changes: Changes): Promise<void> {
        console.log(`applying changes ${changes}`);
        applyUpdate(this.ydoc, toUint8Array(changes));

        await DocModel.updateOne({ docId: this.getId() }, { state: this.encodeStateAsUpdate() });
        // TODO: Save changes
    }

    async syncStart(vector: StateVector): Promise<SyncResponseActorType> {
        const responseVector = Buffer.from(encodeStateVector(this.ydoc));
        const changes = encodeStateAsUpdate(this.ydoc, toUint8Array(vector));

        return {
            vector: fromUint8Array(responseVector),
            changes: fromUint8Array(Buffer.from(changes)),
        };
    }

    async syncComplete({ changes }: SyncCompleteActorType): Promise<void> {
        this.applyDiff(changes);
    }
}
