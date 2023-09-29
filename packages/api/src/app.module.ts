import { Module } from '@nestjs/common';
import { AsyncStorageModule, DaprClientModule, DaprServerModule } from '@a-la-fois/nest-common';
import { ConsumerApiModule } from './consumerApi';
import { ClientApiModule } from './clientApi';
import { AdminApiModule } from './adminApi';
import { DbModule } from './db';
import { config } from './config';
import { HealthModule } from '@a-la-fois/nest-common';
import { MicroserviceModule } from './microservice';
import { PubsubModule, PubsubOptions } from '@a-la-fois/pubsub';

const buildPubsubOptions = (): PubsubOptions => {
    return {
        topicsToSubscribe: [],
        clientId: 'api',
        hosts: config.kafka.hosts.split(','),
        caPath: config.kafka.caPath,
        username: config.kafka.username,
        password: config.kafka.password,
        saslMechanism: config.kafka.mechanism,
    };
};

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
        PubsubModule.forRoot(buildPubsubOptions()),
        HealthModule.forRoot(),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
