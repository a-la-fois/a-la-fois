import { Module } from "@nestjs/common";
import { RedisPubsubService } from './redis-pubsub.service';
import { KafkaPubsubService } from './kafka-pubsub.service';
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  providers: [KafkaPubsubService, RedisPubsubService],
  exports: [KafkaPubsubService, RedisPubsubService],
})
export class PubsubModule { }
