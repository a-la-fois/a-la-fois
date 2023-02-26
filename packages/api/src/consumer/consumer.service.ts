import { Injectable } from '@nestjs/common';
import { Consumer, ConsumerModel } from '@a-la-fois/models';

@Injectable()
export class ConsumerService {
    constructor() {}

    async getConsumer(id: string): Promise<Consumer | null> {
        return ConsumerModel.findOne({ id }) ?? null;
    }
}
