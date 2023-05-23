import { Module } from '@nestjs/common';
import { DaprClientModule, KafkaModule, KafkaOptions } from '@a-la-fois/nest-common';
import { WsModule } from './ws';
import { config } from './config';

const buildKafkaOptions = (): KafkaOptions => {
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
        KafkaModule.forRoot(buildKafkaOptions()),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
