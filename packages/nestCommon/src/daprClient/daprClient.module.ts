import { DynamicModule, ModuleMetadata } from '@nestjs/common';
import { DaprClient } from '@dapr/dapr';

import { DaprClientAsyncOptions, DaprClientOptions } from './types';
import { DAPR_CLIENT_TOKEN } from './constants';

const buildModuleMetadata = (config: DaprClientOptions): ModuleMetadata => {
    const daprClient = new DaprClient({
        daprHost: config.daprHost,
        daprPort: config.daprPort,
    });

    const daprClientProvider = {
        provide: DAPR_CLIENT_TOKEN,
        useValue: daprClient,
    };

    return {
        providers: [daprClientProvider],
        exports: [daprClientProvider],
    };
};

export class DaprClientModule {
    static register(options: DaprClientOptions): DynamicModule {
        return {
            ...buildModuleMetadata(options),
            module: DaprClientModule,
        };
    }

    static forRoot(options: DaprClientOptions): DynamicModule {
        return {
            ...buildModuleMetadata(options),
            module: DaprClientModule,
            global: true,
        };
    }

    static forRootAsync(options: DaprClientAsyncOptions): DynamicModule {
        const daprClientProvider = {
            provide: DAPR_CLIENT_TOKEN,
            inject: options.inject ?? [],
            useFactory: async (...args: any[]) => {
                const config = await options.useFactory(...args);

                return new DaprClient({
                    daprHost: config.daprHost,
                    daprPort: config.daprPort,
                });
            },
        };

        return {
            imports: options.imports ?? [],
            providers: [daprClientProvider],
            exports: [daprClientProvider],
            module: DaprClientModule,
            global: true,
        };
    }
}
