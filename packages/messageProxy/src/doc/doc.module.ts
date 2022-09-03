import { Module } from '@nestjs/common';
import { DocService } from './doc.service';
import { PubsubModule } from '../pubsub/pubsub.module';
import { KafkaPubsubService, KafkaPubSubToken } from '../pubsub/kafka-pubsub.service';
import { RedisPubsubService, RedisPubSubToken } from '../pubsub/redis-pubsub.service';
import { ActorModule } from '../actor/actor.module';

@Module({
    imports: [PubsubModule, ActorModule],
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
