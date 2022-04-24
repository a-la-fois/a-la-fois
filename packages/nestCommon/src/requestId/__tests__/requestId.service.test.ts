import { Test } from '@nestjs/testing';
import supertest from 'supertest';

import { AsyncStorageModule } from '../../asyncStorage';
import { RequestIdOptions } from '../types';
import { RequestIdModule } from '../requestId.module';

import { RequestIdServiceTestModule } from './module/requestIdServiceTest.module';

const getApp = async (options?: RequestIdOptions) => {
    const moduleRef = await Test.createTestingModule({
        imports: [RequestIdModule.forRoot(options), AsyncStorageModule.forRoot(), RequestIdServiceTestModule],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    return app;
};

describe('RequestIdService', () => {
    test('generate new request id', async () => {
        let requestId = '';
        const app = await getApp();

        await supertest(app.getHttpServer())
            .get('/test')
            .expect(200)
            .expect((res) => {
                expect(res.body.requestId).not.toBeUndefined();
                expect(typeof res.body.requestId === 'string');

                requestId = res.body.requestId;
            });

        await supertest(app.getHttpServer())
            .get('/test')
            .expect(200)
            .expect((res) => {
                expect(res.body.requestId).not.toBeUndefined();
                expect(res.body.requestId !== requestId);
            });
    });

    test('return default request id header', async () => {
        const requestId = 'foo';
        const app = await getApp();

        await supertest(app.getHttpServer())
            .get('/test')
            .set('x-request-id', requestId)
            .expect(200)
            .expect((res) => {
                expect(res.body.requestId).toBe(requestId);
            });
    });

    test('return custom request id header', async () => {
        const customHeaderName = 'x-my-header-name';
        const requestId = 'foo';
        const app = await getApp({ headerName: customHeaderName });

        await supertest(app.getHttpServer())
            .get('/test')
            .set(customHeaderName, requestId)
            .expect(200)
            .expect((res) => {
                expect(res.body.requestId).toBe(requestId);
            });
    });

    test('custom uid generator', async () => {
        const requestId = 'foo';
        const app = await getApp({ uid: () => requestId });

        await supertest(app.getHttpServer())
            .get('/test')
            .expect(200)
            .expect((res) => {
                expect(res.body.requestId).toBe(requestId);
            });
    });
});
