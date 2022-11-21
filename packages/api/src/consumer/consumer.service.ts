import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Consumer } from './model';

@Injectable()
export class ConsumerService {
    constructor(@Inject('CONSUMER_MODEL') private readonly consumerModel: Model<Consumer>) {}

    async getConsumer(id: string): Promise<Consumer | undefined> {
        return this.consumerModel.findOne({ id });
    }
}
