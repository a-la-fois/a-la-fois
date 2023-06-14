import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

@Module({
    imports: [],
    providers: [AuthService, TokenService],
    exports: [AuthService],
})
export class AuthModule {}
