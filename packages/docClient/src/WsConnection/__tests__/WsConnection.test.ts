import WS from 'jest-websocket-mock';
import { WsConnection } from '../WsConnection';
import { WS_CLOSE_STATUS_ABNORMAL } from '../constants';
import { wait } from '../../../testUtils/wait';

const wsUrl = 'ws://localhost:1234';

describe('WsConnection', () => {
    let server: WS | null = null;

    beforeEach(() => {
        server = new WS(wsUrl);
    });

    afterEach(() => {
        server?.close();
        server = null;
    });

    test('Connect', async () => {
        const connection = new WsConnection({ url: wsUrl });
        await connection.connect();
        await server?.connected;
    });

    test('connect, disconnect, reconnect flow', async () => {
        const connectListener = jest.fn();
        const disconnectListener = jest.fn();
        const reconnectListener = jest.fn();
        const connection = new WsConnection({ url: wsUrl });
        connection.on('connect', connectListener);
        connection.on('disconnect', disconnectListener);
        connection.on('reconnect', reconnectListener);
        await connection.connect();
        const client = await server?.connected;
        client?.close({
            code: WS_CLOSE_STATUS_ABNORMAL,
            reason: 'test',
            wasClean: false,
        });

        await wait();

        expect(connectListener).toBeCalledTimes(2);
        expect(disconnectListener).toBeCalledTimes(1);
        expect(reconnectListener).toBeCalledTimes(1);
    });

    test('message event', async () => {
        const connection = new WsConnection({ url: wsUrl });
        await connection.connect();
        await server?.connected;

        let receivedData = '';

        connection.on('message', (event) => {
            receivedData = event.data;
        });

        const data = 'foo';
        server?.send(data);

        expect(receivedData).toBe(data);
    });
});
