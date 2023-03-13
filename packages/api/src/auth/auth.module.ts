import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    controllers: [AuthController],
    imports: [],
    exports: [AuthService],
    providers: [AuthService],
})
export class AuthModule {}
