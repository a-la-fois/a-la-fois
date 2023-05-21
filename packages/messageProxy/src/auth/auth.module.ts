import { Module } from '@nestjs/common';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

@Module({
    imports: [PubsubModule],
    providers: [AuthService, TokenService],
    exports: [AuthService],
})
export class AuthModule {}
