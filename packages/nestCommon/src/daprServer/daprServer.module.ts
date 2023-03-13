import { DynamicModule, ModuleMetadata, OnModuleInit } from '@nestjs/common';
import { DaprInvokerCallbackContent, DaprServer, HttpMethod } from '@dapr/dapr';
import { DaprServer as DaprServerDecorator } from './daprServer.decorator';
import { ExplorerService } from './explorer.service';
import { DAPR_SERVER_TOKEN } from './constants';
import { DaprServerAsyncOptions, DaprServerOptions } from './types';

const buildModuleMetadata = (config: DaprServerOptions): ModuleMetadata => {
    const daprServer = new DaprServer(config.serverHost, config.serverPort, config.daprHost, config.daprPort);

    const daprServerProvider = {
        provide: DAPR_SERVER_TOKEN,
        useValue: daprServer,
    };

    return {
        providers: [daprServerProvider, ExplorerService],
        exports: [daprServerProvider],
    };
};

export class DaprServerModule implements OnModuleInit {
    static register(options: DaprServerOptions): DynamicModule {
        return {
            ...buildModuleMetadata(options),
            module: DaprServerModule,
        };
    }

    static forRoot(options: DaprServerOptions): DynamicModule {
        return {
            ...buildModuleMetadata(options),
            module: DaprServerModule,
            global: true,
        };
    }

    static forRootAsync(options: DaprServerAsyncOptions): DynamicModule {
        const daprServerProvider = {
            provide: DAPR_SERVER_TOKEN,
            inject: options.inject ?? [],
            useFactory: async (...args: any[]) => {
                const config = await options.useFactory(...args);

                return new DaprServer(config.serverHost, config.serverPort, config.daprHost, config.daprPort);
            },
        };

        return {
            imports: options.imports ?? [],
            providers: [daprServerProvider, ExplorerService],
            exports: [daprServerProvider],
            module: DaprServerModule,
            global: true,
        };
    }

    constructor(@DaprServerDecorator() private daprServer: DaprServer, private explorerService: ExplorerService) {}

    onModuleInit() {
        this.daprServer.start();
        const invokeHandlers = this.explorerService.explore();

        invokeHandlers.forEach((invokeHandler) => {
            this.daprServer.invoker.listen(
                invokeHandler.method,
                async (data: DaprInvokerCallbackContent) => {
                    const dataParsed = JSON.parse(data.body ?? '');

                    return invokeHandler.callback(dataParsed);
                },
                { method: HttpMethod.POST }
            );
        });
    }
}
