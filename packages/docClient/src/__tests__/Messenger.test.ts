import WS from 'jest-websocket-mock';
import { WsConnection } from '../WsConnection';
import { Messenger } from '../Messenger';

const wsUrl = 'ws://localhost:1234';

describe('Messenger', () => {
    let server: WS | null = null;
    let connection: WsConnection | null = null;
    let messenger: Messenger | null = null;

    const init = async () => {
        connection = new WsConnection({ url: wsUrl });
        messenger = new Messenger({ connection });
        await connection.connect();
        await server?.connected;
    };

    beforeEach(() => {
        server = new WS(wsUrl, { jsonProtocol: true });
    });

    afterEach(() => {
        messenger?.dispose();
        connection?.dispose();
        server?.close();
        server = null;
    });

    test('Messenger', async () => {
        await init();
    });

    test('send message', async () => {
        await init();

        messenger?.sendJoin({ docId: '1' });
        expect(server).toReceiveMessage({ event: 'join', data: { docId: '1' } });
    });

    test('receive message', async () => {
        await init();
        const messageListener = jest.fn();

        messenger?.once('broadcastChanges', messageListener);

        server?.send({
            event: 'broadcastChanges',
            data: {
                changes: '123',
            },
        });

        expect(messageListener).toBeCalledTimes(1);
    });
});
