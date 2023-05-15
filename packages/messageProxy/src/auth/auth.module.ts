import { Module } from '@nestjs/common';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { AuthService } from './auth.service';

@Module({
    imports: [PubsubModule],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}
