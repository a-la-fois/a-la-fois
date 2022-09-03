import { AbstractActor } from '@dapr/dapr';
import { IDocHandler } from './docHandler.interface';
import { Changes, SyncCompletePayload, SyncResponsePayload, SyncStartPayload } from './messages';
import { applyUpdate, Doc, encodeStateAsUpdate, encodeStateVector } from 'yjs';
import { fromUint8Array, toUint8Array } from 'js-base64';

export class DocHandler extends AbstractActor implements IDocHandler {
    // @ts-ignore
    private doc: Doc;

    async onActivate(): Promise<void> {
        this.doc = new Doc();
        // TODO: Upload from a db
    }

    async applyDiff(changes: Changes): Promise<void> {
        applyUpdate(this.doc, toUint8Array(changes));
        // TODO: Save changes and state
    }

    async syncStart({ vector }: SyncStartPayload): Promise<SyncResponsePayload> {
        const responseVector = Buffer.from(encodeStateVector(this.doc));
        const changes = encodeStateAsUpdate(this.doc, toUint8Array(vector));

        return {
            vector: fromUint8Array(responseVector),
            changes: fromUint8Array(Buffer.from(changes)),
        };
    }

    async syncComplete({ changes }: SyncCompletePayload): Promise<void> {
        this.applyDiff(changes);
    }
}
