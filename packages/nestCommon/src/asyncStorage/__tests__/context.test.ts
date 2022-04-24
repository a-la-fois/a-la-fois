import { Test } from '@nestjs/testing';
import supertest from 'supertest';

import { AsyncStorageModule } from '../asyncStorage.module';

import { ContextTestModule } from './module/contextTest.module';

const getApp = async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [ContextTestModule, AsyncStorageModule.forRoot()],
    }).compile();

    const app = moduleRef.createNestApplication();

    await app.init();

    return app;
};

describe('Context', () => {
    test('returns req, res and headers', async () => {
        const app = await getApp();

        await supertest(app.getHttpServer())
            .get('/context')
            .set('my-header', `value1`)
            .expect(200)
            .expect((res) => {
                expect(res.body).toMatchObject({
                    req: true,
                    res: true,
                    headers: {
                        'my-header': 'value1',
                    },
                });
            });

        await supertest(app.getHttpServer())
            .get('/context')
            .set('my-header', `value2`)
            .expect(200)
            .expect((res) => {
                expect(res.body).toMatchObject({
                    req: true,
                    res: true,
                    headers: {
                        'my-header': 'value2',
                    },
                });
            });
    });
});
