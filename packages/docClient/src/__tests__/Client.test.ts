import WS from 'jest-websocket-mock';
import { handleDocSync } from '../../testUtils/handleDocSync';
import { Client } from '../Client';

const wsUrl = 'ws://localhost:1234';

describe('Client', () => {
    let server: WS | null = null;
    let client: Client | null = null;

    const init = async () => {
        client = new Client({
            url: wsUrl,
            apiUrl: 'http://localhost:1234',
        });
        await client.connect();

        return server?.connected;
    };

    beforeEach(() => {
        server = new WS(wsUrl, { jsonProtocol: true });
    });

    afterEach(() => {
        client?.dispose();
        server?.close();
        server = null;
    });

    test('Client', async () => {
        await init();
    });

    test('get doc', async () => {
        const wsClient = await init();

        wsClient?.on('message', handleDocSync(server));

        const doc = await client!.getDoc('1');

        const text = doc.doc.getText('text');
        expect(text.toJSON()).toBe('baz');
    });
});
