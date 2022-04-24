import { TldService } from '../tld.service';

const domains = {
    'yandex.ru': 'ru',
    'yandex.net': 'net',
    'yandex.com.tr': 'com.tr',
    'yandex.co.il': 'co.il',
    'some.host.ru': 'ru',
    'yandex.ru:8080': 'ru',
    'bla.yandex.kyprizel.net': 'net',
    'localhost': 'localhost',
    '.': '',
    '127.0.0.1': null,
    '[::1]': null,
    '127.0.0.1:8080': null,
    '[::1]:8080': null,
};

// @ts-ignore
TldService.prototype.getTld.disableMemoize();

const doTest = (host: string | undefined, shouldBeTld: string | null) => {
    it(`"${host}" tld should equal "${shouldBeTld}"`, () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const context = { req: { headers: { host: host } } } as any;
        const service = new TldService(context);

        const tld = service.getTld();

        expect(tld).toBe(shouldBeTld);
    });
};

describe('TldService', () => {
    describe('undefined host', function () {
        doTest(undefined, null);
    });

    describe('hosts in data.js', function () {
        Object.keys(domains).forEach((key) => {
            doTest(key, domains[key]);
        });
    });
});
