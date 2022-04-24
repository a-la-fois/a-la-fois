import { Test } from '@nestjs/testing';
import supertest from 'supertest';

import { AsyncStorageModule } from '../asyncStorage.module';
import { StorageMemoize } from '../storageMemoize.decorator';

import { StorageMemoizeTestModule } from './module/storageMemoizeTest.module';

const getApp = async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [StorageMemoizeTestModule, AsyncStorageModule.forRoot()],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    return app;
};

describe('StorageMemoize', () => {
    test('Should return same results', async () => {
        const app = await getApp();

        await supertest(app.getHttpServer())
            .get('/storageMemoize/method1')
            .expect(200)
            .expect((res) => {
                expect(res.body.result1).toBe(res.body.result2);
            });
    });

    test('Should return different values in different requests', async () => {
        const app = await getApp();
        let result = -1;

        await supertest(app.getHttpServer())
            .get('/storageMemoize/method1')
            .expect(200)
            .expect((res) => {
                result = res.body.result1;
            });

        await supertest(app.getHttpServer())
            .get('/storageMemoize/method1')
            .expect(200)
            .expect((res) => {
                expect(result).not.toBe(res.body.result1);
            });
    });

    test('Should disable memoization', async () => {
        class Service {
            @StorageMemoize()
            method() {
                const hrTime = process.hrtime();

                return hrTime[0] * 1000000 + hrTime[1] / 1000;
            }
        }

        const instance = new Service();
        // @ts-ignore
        Service.prototype.method.disableMemoize();

        const res1 = instance.method();
        const res2 = instance.method();

        expect(res1).not.toBe(res2);
    });
});
