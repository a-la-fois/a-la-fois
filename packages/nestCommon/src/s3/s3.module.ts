import { DynamicModule, ModuleMetadata } from '@nestjs/common';

import { S3Options } from './types';
import { createClient } from './utils';
import { S3_CLIENT_TOKEN } from './constants';

const buildModuleMetadata = (config: S3Options): ModuleMetadata => {
    const s3Client = createClient(config);

    const s3ClientProvider = {
        provide: S3_CLIENT_TOKEN,
        useValue: s3Client,
    };

    return {
        providers: [s3ClientProvider],
        exports: [s3ClientProvider],
    };
};

export class S3Module {
    static register(options: S3Options): DynamicModule {
        return {
            ...buildModuleMetadata(options),
            module: S3Module,
        };
    }

    static forRoot(options: S3Options): DynamicModule {
        return {
            ...buildModuleMetadata(options),
            module: S3Module,
            global: true,
        };
    }
}
