import { memoize } from 'lodash';

export const Memoize = (): MethodDecorator => {
    return (_target, _propertyKey, descriptor: PropertyDescriptor) => {
        if (descriptor.value) {
            const storageKey = Symbol();
            const originalMethod = descriptor.value;

            descriptor.value = function (...args: unknown[]) {
                // @ts-ignore
                if (!this[storageKey]) {
                    // @ts-ignore
                    this[storageKey] = memoize(originalMethod);
                }

                // @ts-ignore
                return this[storageKey](...args);
            };
        }
    };
};
