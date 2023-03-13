import { SetMetadata } from '@nestjs/common';
import { DAPR_INVOKE_SUBSCRIBER } from './constants';
import { DaprInvokeMetadataConfiguration, HttpMethod } from './types';

export const Invoke = (method: string, httpMethod: HttpMethod = 'get') => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        SetMetadata<string, DaprInvokeMetadataConfiguration>(DAPR_INVOKE_SUBSCRIBER, {
            method,
            httpMethod,
            target,
            targetName: target.constructor.name,
            methodName: propertyKey,
            callback: descriptor.value,
        })(target, propertyKey, descriptor);
    };
};
