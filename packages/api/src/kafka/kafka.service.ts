import { UpdateTokenBroadcastMessage } from '@a-la-fois/message-proxy';
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { Kafka, Producer } from 'kafkajs';
import { config } from 'src/config';

export const SERVICE_TOPIC = config.kafka.serviceTopic;

@Injectable()
export class KafkaService {
    private kafka: Kafka;
    private publisher: Producer;

    constructor() {
        const { caPath, username, password, mechanism, hosts } = config.kafka;

        // TODO: kafka config constructor
        const params = {};

        if (caPath) {
            params['ssl'] = {
                ca: [readFileSync(caPath)],
            };
        }

        if (username && password) {
            params['sasl'] = {
                mechanism,
                username,
                password,
            };
        }

        this.kafka = new Kafka({
            clientId: 'api',
            brokers: hosts.split(','),
            ...params,
        });

        this.connect();
    }

    publish(message: string) {
        this.publisher
            .send({
                topic: SERVICE_TOPIC,
                messages: [
                    {
                        value: Buffer.from(message),
                    },
                ],
            })
            .then(console.log)
            .catch(console.log);
    }

    private connect(): void {
        this.publisher = this.kafka.producer();
        this.publisher.connect().then(() => console.log('Publisher connected to a kafka broker'));
    }
}
