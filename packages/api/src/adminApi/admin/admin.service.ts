import { Consumer } from '@a-la-fois/models';
import { AsyncStorageService, REQ_KEY } from '@a-la-fois/nest-common';
import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { generateKeyPair } from 'node:crypto';
import { config } from '../../config';
import { ConsumerModel, DocModel } from '../../models';

@Injectable()
export class AdminService {
    constructor(private storageService: AsyncStorageService) {}

    async createConsumer({ name, id, publicKey }: Pick<Consumer, 'name' | 'publicKey'> & { id?: string }) {
        const consumer = new ConsumerModel({ name, publicKey });

        if (id) {
            consumer._id = new mongoose.Types.ObjectId(id);
        }

        await consumer.save();

        return {
            consumer,
        };
    }

    async getConsumer(consumerId: string) {
        const consumer = await ConsumerModel.findById(consumerId);

        if (consumer) {
            return null;
        }

        return {
            consumer,
        };
    }

    async updateConsumer({
        consumerId,
        publicKey,
        name,
    }: Partial<Pick<Consumer, 'publicKey' | 'name'>> & { consumerId: string }) {
        const consumer = await ConsumerModel.findById(consumerId);

        if (!consumer) {
            return null;
        }

        if (publicKey) {
            consumer.publicKey = publicKey;
        }

        if (name) {
            consumer.name = name;
        }

        if (publicKey || name) {
            await consumer.save();
        }

        return {
            consumer,
        };
    }

    /**
     * @deprecated
     */
    async regenerateKeys(consumerId: string) {
        const consumer = await ConsumerModel.findById(consumerId);

        if (!consumer) {
            return null;
        }

        const { publicKey, privateKey } = await this.generateKeyPair();

        consumer.publicKey = publicKey;
        await consumer.save();

        return {
            consumer,
            privateKey,
        };
    }

    async createPublicDoc(id?: string) {
        const doc = new DocModel({
            consumer: null,
            public: true,
        });

        if (id) {
            doc._id = new mongoose.Types.ObjectId(id);
        }

        await doc.save();

        return doc;
    }

    async createPrivateDoc(consumerId: string, docId: string) {
        const doc = new DocModel({
            _id: new mongoose.Types.ObjectId(docId),
            owner: new mongoose.Types.ObjectId(consumerId),
            public: false,
        });

        await doc.save();

        return doc;
    }

    isAdmin() {
        if (!config.admin.secret) {
            return false;
        }

        const token = this.storageService.getData<Request>(REQ_KEY).headers['authorization'];

        return token === config.admin.secret;
    }

    /**
     * @deprecated
     */
    private generateKeyPair() {
        return new Promise<{ publicKey: string; privateKey: string }>((resolve, reject) => {
            generateKeyPair(
                'rsa',
                {
                    modulusLength: 4096,
                    publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
                    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
                },
                (err, publicKey, privateKey) => {
                    if (err) {
                        reject(err);
                    }

                    resolve({ publicKey, privateKey });
                }
            );
        });
    }
}
