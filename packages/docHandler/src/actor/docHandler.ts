import { AbstractActor } from '@dapr/dapr';
import { Doc } from '@a-la-fois/models';
import { applyUpdate, Doc as YDoc, encodeStateAsUpdate, encodeStateVector } from 'yjs';
import { fromUint8Array, toUint8Array } from 'js-base64';
import { DocModel, UpdateModel } from '../models';
import { ApplyDiffRequest, Changes, SyncCompleteRequest, SyncStartRequest, SyncStartResponse } from '../messages';
import { IDocHandler } from './docHandler.interface';
import mongoose from 'mongoose';
import { logger } from '../logger';

export class DocHandler extends AbstractActor implements IDocHandler {
    private ydoc!: YDoc;
    private docId!: mongoose.Types.ObjectId;

    private getId(): string {
        return this.getActorId().getId();
    }

    encodeStateAsUpdate(encodedTargetStateVector?: Uint8Array | undefined) {
        const state = encodeStateAsUpdate(this.ydoc, encodedTargetStateVector);

        return Buffer.from(state.buffer);
    }

    async onActivate() {
        this.docId = new mongoose.Types.ObjectId(this.getId());
        this.ydoc = new YDoc();
        const doc: Doc | null = await DocModel.findOne({ _id: this.docId });

        if (doc) {
            applyUpdate(this.ydoc, doc.state);
        }

        logger.info({ docId: this.docId }, 'Actor activated');
    }

    async applyDiff({ changes, userId }: ApplyDiffRequest) {
        await this.saveDiff(changes, userId);
        logger.debug({ docId: this.docId, userId }, 'Changes applied');
    }

    async syncStart({ vector }: SyncStartRequest): Promise<SyncStartResponse> {
        const responseVector = Buffer.from(encodeStateVector(this.ydoc));
        const changes = encodeStateAsUpdate(this.ydoc, toUint8Array(vector));

        logger.debug({ docId: this.docId }, 'Sync started');

        return {
            vector: fromUint8Array(responseVector),
            changes: fromUint8Array(Buffer.from(changes)),
        };
    }

    async syncComplete({ changes, userId }: SyncCompleteRequest) {
        logger.debug({ docId: this.docId }, 'Sync completed');
        return this.saveDiff(changes, userId, true);
    }

    private async saveDiff(changes: Changes, userId: string, checkEmpty = false) {
        const changesBuffer = toUint8Array(changes);
        let currVector: Uint8Array | null = null;

        if (checkEmpty) {
            currVector = encodeStateVector(this.ydoc);
        }

        applyUpdate(this.ydoc, changesBuffer);

        if (checkEmpty) {
            const newVector = encodeStateVector(this.ydoc);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (!this.equalVectors(currVector!, newVector)) {
                return;
            }
        }

        await Promise.all([
            DocModel.updateOne({ _id: this.docId }, { state: this.encodeStateAsUpdate() }),
            UpdateModel.create({
                docId: this.getId(),
                state: Buffer.from(changesBuffer),
                userId: userId,
            }),
        ]);
    }

    private equalVectors(a: Uint8Array, b: Uint8Array) {
        if (a.byteLength !== b.byteLength) {
            return false;
        }

        const aArr = new Int8Array(a);
        const bArr = new Int8Array(b);

        for (let i = 0; i < aArr.length; i++) {
            if (aArr[i] !== bArr[i]) {
                return false;
            }
        }

        return true;
    }
}
