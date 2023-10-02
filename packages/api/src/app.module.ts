import { Module } from '@nestjs/common';
import {
    AsyncStorageModule,
    DaprClientModule,
    DaprServerModule,
    LoggerModule,
    HealthModule,
} from '@a-la-fois/nest-common';
import { ConsumerApiModule } from './consumerApi';
import { ClientApiModule } from './clientApi';
import { AdminApiModule } from './adminApi';
import { DbModule } from './db';
import { config } from './config';
import { MicroserviceModule } from './microservice';
import { PubsubModule, PubsubOptions } from '@a-la-fois/pubsub';

const LOGGER_SERVICE = 'messageProxy';

const buildPubsubOptions = (): PubsubOptions => {
    return {
        topicsToSubscribe: [],
        clientId: 'api',
        hosts: config.kafka.hosts.split(','),
        caPath: config.kafka.caPath,
        username: config.kafka.username,
        password: config.kafka.password,
        saslMechanism: config.kafka.mechanism,
        loggerService: LOGGER_SERVICE,
    };
};

@Module({
    imports: [
        LoggerModule.forRoot({ service: LOGGER_SERVICE }),
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
