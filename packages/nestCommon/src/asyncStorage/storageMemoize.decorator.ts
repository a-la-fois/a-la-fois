import { Inject } from '@nestjs/common';

import { AsyncStorageService } from '../asyncStorage';

export const STORAGE_MEMOIZE_ASYNC_STORAGE_FIELD_NAME = '__memoizeAsyncStorage';

export const StorageMemoize = (storageKey: Symbol = Symbol()): MethodDecorator => {
    const injectAsyncStorage = Inject(AsyncStorageService);

    return (target, _propertyKey, descriptor: PropertyDescriptor) => {
        injectAsyncStorage(target, STORAGE_MEMOIZE_ASYNC_STORAGE_FIELD_NAME);

        if (descriptor.value) {
            const originalMethod = descriptor.value;
            let original = false;

            const disableMemoize = () => {
                original = true;
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const memoizer = function (this: any, ...args: unknown[]) {
                if (original) {
                    return originalMethod.apply(this, args);
                }

                const asyncStorage: AsyncStorageService = this[STORAGE_MEMOIZE_ASYNC_STORAGE_FIELD_NAME];
                const storedValue = asyncStorage.getData(storageKey);

                if (storedValue) {
                    return storedValue;
                }

                const value = originalMethod.apply(this, args);
                asyncStorage.setData(storageKey, value);

                return value;
            };

            memoizer.disableMemoize = disableMemoize;

            descriptor.value = memoizer;
        }
    };
};
