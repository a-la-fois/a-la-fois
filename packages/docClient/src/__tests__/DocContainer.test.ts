import WS from 'jest-websocket-mock';
import { Messenger } from '../Messenger';
import { WsConnection } from '../WsConnection';
import { DocContainer } from '../DocContainer';
import { handleDocSync } from '../../testUtils/handleDocSync';

const wsUrl = 'ws://localhost:1234';

describe('DocContainer', () => {
    let server: WS | null = null;
    let connection: WsConnection | null = null;
    let messenger: Messenger | null = null;
    let doc: DocContainer | null = null;

    const init = async () => {
        connection = new WsConnection({ url: wsUrl });
        messenger = new Messenger({ connection });
        doc = new DocContainer({
            id: '1',
            messenger,
            api: null!, // TODO: mock api
        });
        await connection.connect();
        return await server?.connected;
    };

    beforeEach(() => {
        server = new WS(wsUrl, { jsonProtocol: true });
    });

    afterEach(() => {
        doc?.dispose();
        messenger?.dispose();
        connection?.dispose();
        server?.close();
        server = null;
    });

    test('DocContainer', async () => {
        await init();
    });

    test('send changes', async () => {
        await init();
        const text = doc?.doc.getText('text');
        text?.insert(0, 'foo');

        const message = await server?.nextMessage;
        expect(message).toMatchObject({
            event: 'changes',
            data: {
                docId: '1',
                changes: expect.stringContaining(''),
            },
        });
    });

    test('doc init', async () => {
        const client = await init();

        client?.on('message', handleDocSync(server));

        await doc?.init();

        const syncStartMessage = await server?.nextMessage;
        expect(syncStartMessage).toMatchObject({
            event: 'syncStart',
            data: {
                docId: '1',
                vector: expect.stringContaining(''),
            },
        });

        const syncCompleteMessage = await server?.nextMessage;
        expect(syncCompleteMessage).toMatchObject({
            event: 'syncComplete',
            data: {
                docId: '1',
                changes: expect.stringContaining(''),
            },
        });
    });
});
