import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth';
import { ConsumerService } from './consumer.service';

@Module({
    imports: [AuthModule],
    providers: [ConsumerService],
    exports: [ConsumerService],
})
export class ConsumerModule {}
