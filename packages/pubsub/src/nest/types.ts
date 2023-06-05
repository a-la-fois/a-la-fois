import { ModuleMetadata } from '@nestjs/common';
import { PubsubOptions } from '../core';

export type PubsubAsyncOptions = Pick<ModuleMetadata, 'imports'> & {
    useFactory: (...args: any[]) => Promise<PubsubOptions>;
    inject?: any[];
};
