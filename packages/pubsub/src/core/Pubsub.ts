import { createLogger } from '@a-la-fois/nest-common';
import { readFileSync } from 'fs';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import {
    AttachDocPubsubMessage,
    attachDocMessageType,
    AwarenessPubsubMessage,
    awarenessMessageType,
    ChangesPubsubMessage,
    changesMessageType,
    DetachDocPubsubMessage,
    detachDocMessageType,
    DisconnectPubsubMessage,
    disconnectMessageType,
    UpdateTokenPubsubMessage,
    updateTokenMessageType,
} from '../messages';
import { PubsubOptions } from './types';

type PossiblePubsubMessage =
    | ChangesPubsubMessage
    | AwarenessPubsubMessage
    | UpdateTokenPubsubMessage
    | DetachDocPubsubMessage
    | AttachDocPubsubMessage
    | DisconnectPubsubMessage;

type PubsubMessageTypes = PossiblePubsubMessage['type'];

const MESSAGE_TYPE_TO_TOPIC: Record<PubsubMessageTypes, string> = {
    [changesMessageType]: 'changes',
    [awarenessMessageType]: 'changes',
    [updateTokenMessageType]: 'service',
    [detachDocMessageType]: '',
    [attachDocMessageType]: '',
    [disconnectMessageType]: '',
};

export type MessageSubscriber<T extends PubsubMessageTypes> = (
    message: Extract<PossiblePubsubMessage, { type: T }>,
) => void;

export class Pubsub {
    private topicsToSubscribe: string[];
    private publisher: Producer;
    private subscriber?: Consumer;
    private subscribers: Map<PubsubMessageTypes, MessageSubscriber<any>[]> = new Map();
    private kafka: Kafka;
    private logger;

    constructor(options: PubsubOptions) {
        // TODO: Find a way to use a consumer logger here
        this.logger = createLogger({ service: options.loggerService }).child({ module: this.constructor.name });
        delete options['loggerService'];

        this.topicsToSubscribe = options.topicsToSubscribe;

        this.kafka = new Kafka(this.buildParams(options));

        this.publisher = this.kafka.producer();
        this.publisher.connect().then(() => this.logger.info({}, 'Publisher connected'));

        if (this.topicsToSubscribe) {
            this.subscriber = this.kafka.consumer({
                groupId: uuidv4(),
            });
            this.subscriber.connect().then(() => this.logger.info({}, 'Subscriber connected'));

            this.subscriber.subscribe({
                topics: this.topicsToSubscribe,
                fromBeginning: false,
            });

            this.subscriber.run({
                eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
                    if (!message.value) {
                        return;
                    }

                    this.onMessageRaw(topic, message.value.toString());
                },
            });
        }
    }

    publish(message: PossiblePubsubMessage) {
        this.logger.debug({}, 'Publish message');
        this.send(MESSAGE_TYPE_TO_TOPIC[message.type], JSON.stringify(message));
    }

    publishInternal(message: PossiblePubsubMessage) {
        this.logger.debug({}, 'Publish internal message');
        this.onMessage(message);
    }

    subscribe<T extends PubsubMessageTypes>(messageType: PubsubMessageTypes, subscriber: MessageSubscriber<T>) {
        let subscribersByType = this.subscribers.get(messageType);

        if (subscribersByType) {
            subscribersByType.push(subscriber);
        } else {
            subscribersByType = [subscriber];
        }

        this.subscribers.set(messageType, subscribersByType);
    }

    destroy() {
        if (this.subscriber) {
            this.subscriber.disconnect();
        }

        this.publisher.disconnect();
    }

    private buildParams({ clientId, caPath, username, password, saslMechanism, hosts }: PubsubOptions) {
        // TODO: kafka config constructor
        const params = {};

        if (caPath) {
            params['ssl'] = {
                ca: [readFileSync(caPath)],
            };
        }

        if (username && password) {
            params['sasl'] = {
                mechanism: saslMechanism,
                username,
                password,
            };
        }
        return {
            clientId: clientId,
            brokers: hosts,
            ...params,
        };
    }

    private onMessageRaw = (_topic: string, message: string) => {
        const broadcastMessage: PossiblePubsubMessage = JSON.parse(message);
        this.onMessage(broadcastMessage);
    };

    private onMessage = (message: PossiblePubsubMessage) => {
        this.logger.debug({}, 'Message recieved');
        const subscribersByType = this.subscribers.get(message.type);

        if (!subscribersByType) {
            return;
        }

        for (const sub of subscribersByType) {
            sub(message);
        }
    };

    private send(topic: string, message: string): void {
        this.publisher
            .send({
                topic: topic,
                messages: [
                    {
                        value: Buffer.from(message),
                    },
                ],
            })
            .then((_r) => this.logger.debug({}, 'Message sent'))
            .catch((err) => this.logger.error({ err }, `Couldnt't send message`));
    }
}
