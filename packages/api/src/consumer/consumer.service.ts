import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Consumer } from './model';

@Injectable()
export class ConsumerService {
    constructor(@InjectModel('Consumer') private readonly consumerModel: Model<Consumer>) {}

    async getConsumer(id: string): Promise<Consumer | undefined> {
        return this.consumerModel.findOne({ id });
    }
}
