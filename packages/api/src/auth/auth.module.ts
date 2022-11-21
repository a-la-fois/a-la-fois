import { Module } from '@nestjs/common';
import { ConsumerService } from 'src/consumer/consumer.service';
import { ConsumerModel } from 'src/consumer/model';
import { AuthService } from './auth.service';

@Module({
    controllers: [ConsumerService],
    providers: [AuthService, ConsumerModel],
})
export class AuthModule {}
