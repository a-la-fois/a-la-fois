import { Test } from '@nestjs/testing';
import supertest from 'supertest';

import { AsyncStorageModule } from '../../asyncStorage';

import { CookieServiceTestModule } from './module/cookieServiceTest.module';

const getApp = async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [CookieServiceTestModule, AsyncStorageModule.forRoot()],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    return app;
};

describe('CookieService', () => {
    test('returns parser cookies', async () => {
        const app = await getApp();

        await supertest(app.getHttpServer())
            .get('/cookie')
            .set('Cookie', `foo=1; bar=2`)
            .set('Host', 'yandex.ru')
            .expect(200)
            .expect((res) => {
                expect(res.body).toMatchObject({
                    cookies: {
                        foo: '1',
                        bar: '2',
                    },
                });
            });
    });

    test('returns empty cookies object', async () => {
        const app = await getApp();

        await supertest(app.getHttpServer())
            .get('/cookie')
            .set('Host', 'yandex.ru')
            .expect(200)
            .expect((res) => {
                expect(res.body).toMatchObject({
                    cookies: {},
                });
            });
    });
});
