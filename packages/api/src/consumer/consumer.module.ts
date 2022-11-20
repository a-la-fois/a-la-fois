import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';

@Module({
    controllers: [],
    providers: [ConsumerService],
})
export class ConsumerModule {}
