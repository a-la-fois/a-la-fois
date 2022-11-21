import { Injectable } from '@nestjs/common';
import { ConsumerService } from 'src/consumer/consumer.service';

@Injectable()
export class AuthService {
    constructor(private consumerService: ConsumerService) {}

    // async validateConsumer(consumerId: string): Promise<Boolean> {
    // }
}
