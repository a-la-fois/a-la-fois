import { AbstractActor } from '@dapr/dapr';
import { IDocHandler } from './docHandler.interface';
import { Changes, StateVector, SyncCompleteActorType, SyncResponseActorType } from '../messages';
import { applyUpdate, Doc as YDoc, encodeStateAsUpdate, encodeStateVector } from 'yjs';
import { fromUint8Array, toUint8Array } from 'js-base64';
import { Doc, IDoc } from '../models';

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
        const doc: IDoc | null = await Doc.findOne({ docId: this.getId() });
        console.log(doc);
        console.log(`docs = ${await Doc.find().exec()}`);

        if (doc) {
            applyUpdate(this.ydoc, doc.state);
        } else {
            await Doc.create({
                docId: this.getId(),
                state: this.encodeStateAsUpdate(),
            });
        }
    }

    async applyDiff(changes: Changes): Promise<void> {
        console.log(`applying changes ${changes}`);
        applyUpdate(this.ydoc, toUint8Array(changes));

        await Doc.updateOne({ docId: this.getId() }, { state: this.encodeStateAsUpdate() });
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
