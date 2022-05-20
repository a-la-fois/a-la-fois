import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import WebSocket from 'ws';
import { Hero, HeroById } from '../../proto/hero';
import { packMessage, unpackMessage } from '../lib/message';

import { ProtobufWsAdapter } from '../protobufWsAdapter';

import {
    heroRequestType,
    ProtobufWsAdapterTestModule,
} from './protobufWSAdapterTest.module';

const waitOpen = async (ws: WebSocket) => {
    return new Promise((resolve) => {
        ws.on('open', resolve);
    });
};

const waitMessage = async (ws: WebSocket) => {
    return new Promise<ArrayBuffer>((resolve) => {
        ws.on('message', resolve);
    });
};

const getApp = async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [ProtobufWsAdapterTestModule],
    }).compile();

    const app = moduleRef.createNestApplication();
    app.useWebSocketAdapter(new ProtobufWsAdapter(app));
    await app.init();

    return app;
};

describe('ProtobufWsAdapter', () => {
    let app: INestApplication | null = null;
    let ws: WebSocket | null = null;

    afterEach(async () => {
        if (ws) {
            ws.close();
        }

        if (app) {
            await app.close();
        }
    });

    test.only('returns parser cookies', async () => {
        app = await getApp();

        const port = 3000;
        await app.listen(port);

        ws = new WebSocket(`ws://localhost:${port}`);
        ws.binaryType = 'arraybuffer';

        await waitOpen(ws);

        const data = HeroById.encode({
            id: 33,
        }).finish();

        const message = packMessage(heroRequestType, data);
        ws.send(message);

        const responseData = await waitMessage(ws);
        const r = unpackMessage(responseData);
        const hero = Hero.decode(r.data);

        console.log('response', hero);
    });

    test('returns empty cookies object', async () => {
        const app = await getApp();
    });
});
