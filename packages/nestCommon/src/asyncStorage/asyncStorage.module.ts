import { DynamicModule, MiddlewareConsumer, NestModule } from '@nestjs/common';

import { AsyncStorageMiddleware } from './asyncStorage.middleware';
import { AsyncStorageService } from './asyncStorage.service';
import { Context } from './context';

export class AsyncStorageModule implements NestModule {
    static forRoot(): DynamicModule {
        return {
            providers: [AsyncStorageService, Context, AsyncStorageMiddleware],
            exports: [AsyncStorageService, Context, AsyncStorageMiddleware],
            module: AsyncStorageModule,
            global: true,
        };
    }

    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AsyncStorageMiddleware).forRoutes('*');
    }
}
