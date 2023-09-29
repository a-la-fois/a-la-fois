import { Module } from '@nestjs/common';
import { DaprClientModule, LoggerModule } from '@a-la-fois/nest-common';
import { PubsubModule, PubsubOptions } from '@a-la-fois/pubsub';
import { WsModule } from './ws';
import { config } from './config';
import { HealthModule } from '@a-la-fois/nest-common';

const buildPubsubOptions = (): PubsubOptions => {
    return {
        clientId: 'messageProxy',
        topicsToSubscribe: [config.kafka.changesTopic, config.kafka.serviceTopic],
        hosts: config.kafka.hosts.split(','),
        caPath: config.kafka.caPath,
        username: config.kafka.username,
        password: config.kafka.password,
        saslMechanism: config.kafka.mechanism,
    };
};

@Module({
    imports: [
        WsModule,
        DaprClientModule.forRoot({
            daprHost: config.dapr.host,
            daprPort: config.dapr.port,
        }),
        PubsubModule.forRoot(buildPubsubOptions()),
        LoggerModule.forRoot({ service: 'messageProxy' }),
        HealthModule.forRoot(),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
