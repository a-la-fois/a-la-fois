import { Injectable, CanActivate } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class ConsumerGuard implements CanActivate {
    constructor(private authService: AuthService) {}

    async canActivate() {
        const consumer = await this.authService.getConsumer();

        return Boolean(consumer);
    }
}
