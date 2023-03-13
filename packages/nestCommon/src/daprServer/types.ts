import { ModuleMetadata } from '@nestjs/common';

export type DaprServerOptions = {
    serverHost: string;
    serverPort: string;
    daprHost: string;
    daprPort: string;
};

export type DaprServerAsyncOptions = Pick<ModuleMetadata, 'imports'> & {
    useFactory: (...args: any[]) => Promise<DaprServerOptions>;
    inject?: any[];
};

export type HttpMethod = 'get' | 'delete' | 'post' | 'put';

export type DaprInvokeMetadataConfiguration = {
    method: string;
    httpMethod: HttpMethod;
    target: any;
    targetName: string;
    methodName: string;
    callback: (...args: any[]) => any;
};
