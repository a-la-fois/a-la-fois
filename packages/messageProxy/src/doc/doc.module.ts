import { Module } from '@nestjs/common';
import { DocService } from './doc.service';
import { PubsubModule } from '../pubsub/pubsub.module';
import { KafkaPubsubService, KafkaPubSubToken } from '../pubsub/kafka-pubsub.service';
import { RedisPubsubService, RedisPubSubToken } from '../pubsub/redis-pubsub.service';
import { DaprModule } from '../dapr/dapr.module';

@Module({
  imports: [PubsubModule, DaprModule],
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
export class DocModule {
}