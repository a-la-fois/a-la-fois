import { Module } from "@nestjs/common";
import { RedisPubsubService } from './redis-pubsub.service';
import { KafkaPubsubService } from './kafka-pubsub.service';

@Module({
  imports: [],
  providers: [KafkaPubsubService, RedisPubsubService],
  exports: [KafkaPubsubService, RedisPubsubService],
})
export class PubsubModule {}