import { Test } from '@nestjs/testing';
import supertest from 'supertest';

import { AsyncStorageModule } from '../asyncStorage.module';

import { AsyncStorageServiceTestModule } from './module/asyncStorageServiceTest.module';

const getApp = async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [AsyncStorageServiceTestModule, AsyncStorageModule.forRoot()],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    return app;
};

describe('AsyncStorageService', () => {
    test('returns req and res', async () => {
        const app = await getApp();

        await supertest(app.getHttpServer())
            .get('/asyncStorage')
            .expect(200)
            .expect((res) => {
                expect(res.body).toMatchObject({
                    req: true,
                    res: true,
                });
            });
    });
});
