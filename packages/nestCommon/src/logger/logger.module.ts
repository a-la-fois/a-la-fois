import { DynamicModule, ModuleMetadata } from '@nestjs/common';
import { LoggerOptions, createLogger } from './logger';
import { LoggerService } from './logger.service';

const buildModuleMetadata = (options?: Partial<LoggerOptions>): ModuleMetadata => {
    const logger = createLogger(options);

    const loggerServiceProvider = {
        provide: LoggerService,
        useValue: logger,
    };

    return {
        providers: [loggerServiceProvider],
        exports: [loggerServiceProvider],
    };
};

export class LoggerModule {
    static register(options?: Partial<LoggerOptions>): DynamicModule {
        return {
            ...buildModuleMetadata(options),
            module: LoggerModule,
        };
    }

    static forRoot(options?: Partial<LoggerOptions>): DynamicModule {
        return {
            ...buildModuleMetadata(options),
            module: LoggerModule,
            global: true,
        };
    }

    static forRootAsync(options: LoggerAsyncOptions): DynamicModule {
        const loggerServiceProvider = {
            provide: LoggerService,
            inject: options.inject ?? [],
            useFactory: async (...args: any[]) => {
                const config = await options.useFactory(...args);

                return createLogger(config);
            },
        };

        return {
            imports: options.imports ?? [],
            providers: [loggerServiceProvider],
            exports: [loggerServiceProvider],
            module: LoggerModule,
            global: true,
        };
    }
}

export type LoggerAsyncOptions = Pick<ModuleMetadata, 'imports'> & {
    useFactory: (...args: any[]) => Promise<Partial<LoggerOptions>>;
    inject?: any[];
};
