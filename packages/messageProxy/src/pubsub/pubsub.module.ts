import { Module } from '@nestjs/common';
import { KafkaPubsubService } from './kafka-pubsub.service';
import { ConfigModule } from '@nestjs/config';
import { PubsubService } from './pubsub.service';

@Module({
    imports: [ConfigModule],
    providers: [KafkaPubsubService],
    exports: [PubsubService],
})
export class PubsubModule {}
