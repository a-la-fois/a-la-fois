import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Consumer } from '@a-la-fois/models';
import { AsyncStorageService, REQ_KEY, StorageMemoize } from '@a-la-fois/nest-common';
import { ConsumerModel } from '../../models';
import { AuthService } from '../../auth';

const CONSUMER_KEY = Symbol('CONSUMER_KEY');

@Injectable()
export class ConsumerService {
    constructor(private storageService: AsyncStorageService, private authService: AuthService) {}

    async getConsumer(id: string): Promise<Consumer | null> {
        return ConsumerModel.findOne({ id }) ?? null;
    }

    @StorageMemoize(CONSUMER_KEY)
    async getCurrentConsumer() {
        const token = this.storageService.getData<Request>(REQ_KEY).headers['authorization'];

        if (!token) {
            return null;
        }

        const payload = await this.authService.checkJWT(token);

        if (!payload) {
            throw new UnauthorizedException('JWT token is not valid.');
        }

        const consumer = await this.getConsumer(payload.consumerId);

        return consumer;
    }
}
