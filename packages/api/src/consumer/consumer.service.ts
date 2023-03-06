import { Injectable } from '@nestjs/common';
import { Consumer } from '@a-la-fois/models';
import { ConsumerModel } from '../models';

@Injectable()
export class ConsumerService {
    constructor() {}

    async getConsumer(id: string): Promise<Consumer | null> {
        return ConsumerModel.findOne({ id }) ?? null;
    }
}
