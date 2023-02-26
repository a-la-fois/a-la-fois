import { Module } from '@nestjs/common';
import { ConsumerModule } from '../consumer';
import { AuthService } from './auth.service';
import { ConsumerGuard } from './consumer.guard';

@Module({
    imports: [ConsumerModule],
    exports: [AuthService, ConsumerGuard],
    providers: [AuthService, ConsumerGuard],
})
export class AuthModule {}
