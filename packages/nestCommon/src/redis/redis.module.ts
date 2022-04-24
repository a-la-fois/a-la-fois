import { DynamicModule, ModuleMetadata } from '@nestjs/common';

import { RedisOptions } from './types';
import { REDIS_CLIENT_TOKEN } from './constants';
import { createClient } from './utils';

const buildModuleMetadata = (config: RedisOptions): ModuleMetadata => {
    const redisClient = createClient(config);

    const redisClientProvider = {
        provide: REDIS_CLIENT_TOKEN,
        useValue: redisClient,
    };

    return {
        providers: [redisClientProvider],
        exports: [redisClientProvider],
    };
};

export class RedisModule {
    static register(options: RedisOptions): DynamicModule {
        return {
            ...buildModuleMetadata(options),
            module: RedisModule,
        };
    }

    static forRoot(options: RedisOptions): DynamicModule {
        return {
            ...buildModuleMetadata(options),
            module: RedisModule,
            global: true,
        };
    }
}
