import WS from 'jest-websocket-mock';
import { fromUint8Array, toUint8Array } from 'js-base64';
import { Doc, encodeStateAsUpdate, encodeStateVector } from 'yjs';

const yDoc = new Doc();
const yText = yDoc.getText('text');
yText.insert(0, 'baz');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleDocSync = (server: WS | null) => (eventData: any) => {
    const payload = JSON.parse(eventData as string);

    if (payload.event !== 'syncStart') {
        return;
    }

    const changes = encodeStateAsUpdate(yDoc, toUint8Array(payload.data.vector));
    const vector = encodeStateVector(yDoc);

    server?.send({
        event: 'syncResponse',
        data: {
            docId: payload.data.docId,
            changes: fromUint8Array(changes),
            vector: fromUint8Array(vector),
        },
    });
};
