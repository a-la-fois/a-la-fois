import { applyUpdate, Doc, encodeStateAsUpdate, encodeStateVector } from 'yjs';
import { toUint8Array, fromUint8Array } from 'js-base64';
import { Messenger } from './Messenger';
import {
    broadcastChangesEvent,
    BroadcastChangesPayload,
    syncResponseEvent,
    SyncResponsePayload,
    joinResponseEvent,
    JoinResponsePayload,
    broadcastAwarenessEvent,
    BroadcastAwarenessPayload,
} from '@a-la-fois/message-proxy';
import { applyAwarenessUpdate, Awareness, encodeAwarenessUpdate } from 'y-protocols/awareness';

const ORIGIN_APPLY_CHANGES = '__apply__';

export type DocContainerConfig = {
    id: string;
    messenger: Messenger;
};

export class DocContainer {
    readonly id: string;
    readonly doc: Doc;
    private messenger: Messenger;
    readonly awareness: Awareness;
    private syncPromise: Promise<void> | null = null;

    constructor({ id, messenger }: DocContainerConfig) {
        this.id = id;
        this.messenger = messenger;
        this.doc = new Doc();
        this.awareness = new Awareness(new Doc());

        this.doc.on('update', this.handleChange);
        this.awareness.on('update', this.handleAwareness);

        this.messenger.on(broadcastAwarenessEvent, this.handleReceiveAwareness);
        this.messenger.on(broadcastChangesEvent, this.handleReceiveChanges);
        this.messenger.on(joinResponseEvent, (data: JoinResponsePayload) => {
            if (data.status === 'ok') {
                this.sync();
            }
        });
    }

    async init() {
        this.messenger.sendJoin({ docId: this.id });

        if (this.awareness.getLocalState() !== null) {
            const arr = Array.from(this.awareness.getStates().keys());

            const state = encodeAwarenessUpdate(this.awareness, arr);
            this.messenger.sendAwareness({
                docId: this.id,
                awareness: fromUint8Array(state),
            });
        }
    }

    dispose() {
        this.messenger.off(broadcastChangesEvent, this.handleReceiveChanges);
        this.doc.off('update', this.handleChange);
        this.doc.destroy();
        this.awareness.destroy();
        this.messenger.off(broadcastAwarenessEvent, this.handleReceiveAwareness);
    }

    private handleChange = (update: Uint8Array, origin: any) => {
        if (origin !== ORIGIN_APPLY_CHANGES) {
            const encodedChanges = fromUint8Array(update);

            this.messenger.sendChanges({
                docId: this.id,
                changes: encodedChanges,
            });
        }
    };

    private handleAwareness = ({ added, updated, removed }, origin) => {
        if (origin === 'local') {
            const changedClients = added.concat(updated).concat(removed);
            const changes = encodeAwarenessUpdate(this.awareness, changedClients);

            this.messenger.sendAwareness({
                docId: this.id,
                awareness: fromUint8Array(changes),
            });
        }
    };

    private handleReceiveChanges = (payload: BroadcastChangesPayload) => {
        if (payload.docId === this.id) {
            const update = toUint8Array(payload.changes);
            applyUpdate(this.doc, update, ORIGIN_APPLY_CHANGES);

            if (this.needSync()) {
                this.sync();
            }
        }
    };

    private handleReceiveAwareness = (payload: BroadcastAwarenessPayload) => {
        if (payload.docId === this.id) {
            const update = toUint8Array(payload.awareness);

            applyAwarenessUpdate(this.awareness, update, this.awareness.clientID);
        }
    };

    private needSync() {
        return this.doc.store.pendingDs !== null || this.doc.store.pendingStructs !== null;
    }

    private async sync() {
        if (this.syncPromise) {
            return this.syncPromise;
        }

        try {
            this.syncPromise = this.syncProcess();
            await this.syncPromise;
        } catch (err) {
            console.error('Sync error:', err);
        } finally {
            this.syncPromise = null;
        }
    }

    private async syncProcess() {
        const vector = encodeStateVector(this.doc);
        this.messenger.sendSyncStart({
            docId: this.id,
            vector: fromUint8Array(vector),
        });

        const response = await this.waitSyncResponse();

        applyUpdate(this.doc, toUint8Array(response.changes), ORIGIN_APPLY_CHANGES);
        const returnChanges = encodeStateAsUpdate(this.doc, toUint8Array(response.vector));

        this.messenger.sendSyncComplete({
            docId: this.id,
            changes: fromUint8Array(returnChanges),
        });
    }

    private waitSyncResponse(timeout = 5000) {
        return new Promise<SyncResponsePayload>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                clear();
                reject(new Error('Sync response timeout'));
            }, timeout);

            const clear = () => {
                clearTimeout(timeoutId);
                this.messenger.off(syncResponseEvent, handler);
            };

            const handler = (payload: SyncResponsePayload) => {
                if (payload.docId === this.id) {
                    clear();
                    resolve(payload);
                }
            };

            this.messenger.on(syncResponseEvent, handler);
        });
    }
}
