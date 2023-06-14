import { DynamicModule, ModuleMetadata } from '@nestjs/common';
import { Pubsub, PubsubOptions } from '../core';
import { PUBSUB_TOKEN } from './constants';
import { PubsubAsyncOptions } from './types';

const buildModuleMetadata = (config: PubsubOptions): ModuleMetadata => {
    const pubsub = new Pubsub(config);

    const pubsubProvider = {
        provide: PUBSUB_TOKEN,
        useValue: pubsub,
    };

    return {
        providers: [pubsubProvider],
        exports: [pubsubProvider],
    };
};

export class PubsubModule {
    static register(options: PubsubOptions): DynamicModule {
        return {
            ...buildModuleMetadata(options),
            module: PubsubModule,
        };
    }

    static forRoot(options: PubsubOptions): DynamicModule {
        return {
            ...buildModuleMetadata(options),
            module: PubsubModule,
            global: true,
        };
    }

    static forRootAsync(options: PubsubAsyncOptions): DynamicModule {
        const pubsubProvider = {
            provide: PUBSUB_TOKEN,
            inject: options.inject ?? [],
            useFactory: async (...args: any[]) => {
                const config = await options.useFactory(...args);

                return new Pubsub(config);
            },
        };

        return {
            imports: options.imports ?? [],
            providers: [pubsubProvider],
            exports: [pubsubProvider],
            module: PubsubModule,
            global: true,
        };
    }
}
