import { Module } from '@nestjs/common';
import { AsyncStorageModule, DaprClientModule, DaprServerModule } from '@a-la-fois/nest-common';
import { ConsumerApiModule } from './consumerApi';
import { ClientApiModule } from './clientApi';
import { AdminApiModule } from './adminApi';
import { DbModule } from './db';
import { config } from './config';
import { MicroserviceModule } from './microservice';

@Module({
    imports: [
        ConsumerApiModule,
        ClientApiModule,
        MicroserviceModule,
        AdminApiModule,

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
