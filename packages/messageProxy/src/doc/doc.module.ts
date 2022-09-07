import { Module } from '@nestjs/common';
import { DocService } from './doc.service';
import { PubsubModule } from '../pubsub/pubsub.module';
import { KafkaPubsubService, KafkaPubSubToken } from '../pubsub/kafka-pubsub.service';
import { RedisPubsubService, RedisPubSubToken } from '../pubsub/redis-pubsub.service';
import { ActorModule } from '../actor/actor.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [PubsubModule, ActorModule, ConfigModule],
    providers: [
        DocService,
        {
            provide: KafkaPubSubToken,
            useClass: KafkaPubsubService,
        },
        {
            provide: RedisPubSubToken,
            useClass: RedisPubsubService,
        },
    ],
    exports: [DocService],
})
export class DocModule {}
