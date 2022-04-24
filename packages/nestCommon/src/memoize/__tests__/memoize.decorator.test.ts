import { Memoize } from '../memoize.decorator';

describe('@Memoize', () => {
    test('should memoize without args', () => {
        const func = jest.fn(() => {});

        class TestClass {
            @Memoize()
            method() {
                func();
            }
        }

        const item = new TestClass();

        item.method();
        item.method();

        expect(func.mock.calls.length).toBe(1);
    });

    test('should memoize with same arg', () => {
        const func = jest.fn((x) => x + 1);

        class TestClass {
            @Memoize()
            method(x: number) {
                func(x);
            }
        }

        const item = new TestClass();

        item.method(1);
        item.method(1);

        expect(func.mock.calls.length).toBe(1);
    });

    test("shouldn't memoize with different args", () => {
        const func = jest.fn((x) => x + 1);

        class TestClass {
            @Memoize()
            method(x: number) {
                func(x);
            }
        }

        const item = new TestClass();

        item.method(1);
        item.method(2);

        expect(func.mock.calls.length).toBe(2);
    });

    test('should memoize after changed value', () => {
        const func = jest.fn((x) => x + 1);

        class TestClass {
            @Memoize()
            method(x: number) {
                func(x);
            }
        }

        const item = new TestClass();

        item.method(1);
        item.method(2);
        item.method(1);

        expect(func.mock.calls.length).toBe(2);
    });

    test('should memoize after changed value2', () => {
        const func = jest.fn((x) => x + 1);

        class TestClass {
            constructor(public a: string) {}
            @Memoize()
            method(x: number) {
                func(x);
            }
        }

        const item = new TestClass('foo');
        const item2 = new TestClass('bar');

        item.method(1);
        item2.method(1);
        item.method(1);

        expect(func.mock.calls.length).toBe(2);
    });
});
