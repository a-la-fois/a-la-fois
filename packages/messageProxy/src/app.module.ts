import { Module } from '@nestjs/common';
import { DaprClientModule, LoggerModule, HealthModule } from '@a-la-fois/nest-common';
import { PubsubModule, PubsubOptions } from '@a-la-fois/pubsub';
import { WsModule } from './ws';
import { config } from './config';

const LOGGER_SERVICE = 'messageProxy';

const buildPubsubOptions = (): PubsubOptions => {
    return {
        clientId: 'messageProxy',
        topicsToSubscribe: [config.kafka.changesTopic, config.kafka.serviceTopic],
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
        WsModule,
        DaprClientModule.forRoot({
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
