import { Awareness } from 'y-protocols/awareness';
import { Doc } from 'yjs';
import { Messenger } from './Messenger';

export type AwarenessContainerConfig = {
    messenger: Messenger;
};

export class AwarenessContainer {
    readonly awareness: Awareness;
    private messenger: Messenger;

    constructor({ messenger }: AwarenessContainer) {
        this.messenger = messenger;
        this.awareness = new Awareness(new Doc());
    }
}
