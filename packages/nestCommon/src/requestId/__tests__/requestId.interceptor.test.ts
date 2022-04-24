import { Test } from '@nestjs/testing';
import supertest from 'supertest';

import { AsyncStorageModule } from '../../asyncStorage';
import { RequestIdOptions } from '../types';
import { RequestIdModule } from '../requestId.module';

import { RequestIdInterceptorTestModule } from './module/requestIdInterceptorTest.module';

const getApp = async (options?: RequestIdOptions) => {
    const moduleRef = await Test.createTestingModule({
        imports: [RequestIdModule.forRoot(options), AsyncStorageModule.forRoot(), RequestIdInterceptorTestModule],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    return app;
};

describe('RequestIdInterceptor', () => {
    test('generate new request id', async () => {
        let firstRequestId = '';
        const app = await getApp();

        await supertest(app.getHttpServer())
            .get('/test')
            .expect(200)
            .expect((res) => {
                const requestId = res.headers['x-request-id'];
                expect(requestId).not.toBeUndefined();

                firstRequestId = requestId;
            });

        await supertest(app.getHttpServer())
            .get('/test')
            .expect(200)
            .expect((res) => {
                const requestId = res.headers['x-request-id'];
                expect(requestId).not.toBeUndefined();

                expect(res.body.requestId !== firstRequestId);
            });
    });

    test('return passed x-request-id', async () => {
        const requestId = 'foo';
        const app = await getApp();

        await supertest(app.getHttpServer())
            .get('/test')
            .set('x-request-id', requestId)
            .expect(200)
            .expect((res) => {
                const resRequestId = res.headers['x-request-id'];
                expect(resRequestId).toBe(requestId);
            });
    });
});
