import { Module } from '@nestjs/common';
import { AsyncStorageModule, DaprClientModule, DaprServerModule } from '@a-la-fois/nest-common';
import { DocsModule } from './docs/docs.module';
import { DbModule } from './db';
import { config } from './config';

@Module({
    imports: [
        DocsModule,
        DbModule.forRoot(),
        AsyncStorageModule.forRoot(),
        DaprClientModule.forRoot({
            daprHost: config.dapr.host,
            daprPort: config.dapr.port,
        }),
        DaprServerModule.forRoot({
            serverHost: config.dapr.serverHost,
            serverPort: config.dapr.serverPort,
            daprHost: config.dapr.host,
            daprPort: config.dapr.port,
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
