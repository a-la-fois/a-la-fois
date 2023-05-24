import { KafkaService } from '@a-la-fois/nest-common';
import { Injectable } from '@nestjs/common';
import { config } from 'src/config';

const SERVICE_TOPIC = config.kafka.serviceTopic;

@Injectable()
export class PubsubService {
    constructor(private readonly kafka: KafkaService) {}

    publish(message: string) {
        this.kafka.publish(SERVICE_TOPIC, message);
    }
}
