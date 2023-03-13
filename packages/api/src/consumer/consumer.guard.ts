import { Injectable, CanActivate } from '@nestjs/common';
import { ConsumerService } from './consumer.service';

@Injectable()
export class ConsumerGuard implements CanActivate {
    constructor(private consumerService: ConsumerService) {}

    async canActivate() {
        const consumer = await this.consumerService.getCurrentConsumer();

        return Boolean(consumer);
    }
}
