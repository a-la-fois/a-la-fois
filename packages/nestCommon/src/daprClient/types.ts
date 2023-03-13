import { ModuleMetadata } from '@nestjs/common';

export type DaprClientOptions = {
    daprHost: string;
    daprPort: string;
};

export type DaprClientAsyncOptions = Pick<ModuleMetadata, 'imports'> & {
    useFactory: (...args: any[]) => Promise<DaprClientOptions>;
    inject?: any[];
};
