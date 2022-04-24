import { memoize } from 'lodash';

export const Memoize = (): MethodDecorator => {
    return (_target, _propertyKey, descriptor: PropertyDescriptor) => {
        if (descriptor.value) {
            const storageKey = Symbol();
            const originalMethod = descriptor.value;

            descriptor.value = function (...args: unknown[]) {
                if (!this[storageKey]) {
                    this[storageKey] = memoize(originalMethod);
                }

                return this[storageKey](...args);
            };
        }
    };
};
