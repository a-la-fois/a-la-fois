import { AsyncStorageService, REQ_KEY, StorageMemoize } from '@a-la-fois/nest-common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { verify } from 'jsonwebtoken';
import { ConsumerService } from '../consumer';

const CONSUMER_KEY = Symbol('CONSUMER_KEY');

@Injectable()
export class AuthService {
    constructor(private consumerService: ConsumerService, private storageService: AsyncStorageService) {}

    @StorageMemoize(CONSUMER_KEY)
    async getConsumer() {
        const token = this.storageService.getData<Request>(REQ_KEY).headers['authorization'];

        if (!token) {
            return null;
        }

        const [_headers, payload, _sign] = token.split('.');

        if (!payload) {
            throw new UnauthorizedException('JWT token has wrong format.');
        }

        let payloadData: AuthPayload;

        try {
            payloadData = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
        } catch (_err) {
            throw new UnauthorizedException('JWT token payload has wrong format.');
        }

        if (!payloadData.id) {
            throw new UnauthorizedException('JWT token consumer id is not provided.');
        }

        const consumer = await this.consumerService.getConsumer(payloadData.id);

        try {
            await this.verifyToken(token, consumer.publicKey);
        } catch (_err) {
            throw new UnauthorizedException('JWT token is not valid.');
        }

        return consumer;
    }

    async hasAccessToDoc(docId: string) {
        return false;
    }

    private verifyToken(token: string, publicKey: string) {
        return new Promise((resolve, reject) => {
            verify(token, publicKey, (err, payload: AuthPayload) => {
                if (err) {
                    return reject(err);
                }

                resolve(payload);
            });
        });
    }
}

export type AuthPayload = {
    id: string;
};
