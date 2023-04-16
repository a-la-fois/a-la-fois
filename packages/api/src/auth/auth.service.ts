import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';
import { ConsumerModel, DocModel } from '../models';
import { JWTPayload } from '../messages';
import { parseJWT } from './utils';

@Injectable()
export class AuthService {
    async checkJWT<TJWTPayload extends JWTPayload = JWTPayload>(jwt: string): Promise<TJWTPayload | null> {
        const jwtPayload = parseJWT<TJWTPayload>(jwt);

        if (!jwtPayload?.consumerId) {
            return null;
        }

        const consumer = await ConsumerModel.findById(jwtPayload.consumerId);

        if (!consumer) {
            return null;
        }

        try {
            const payload = await this.verifyToken<TJWTPayload>(jwt, consumer.publicKey);

            return payload;
        } catch (err) {
            return null;
        }
    }

    async consumerOwnsDocs(consumerId: string, docs: string[]): Promise<boolean> {
        const docModels = await DocModel.find(
            {
                consumer: new mongoose.Types.ObjectId(consumerId),
                _id: { $in: docs.map((docId) => new mongoose.Types.ObjectId(docId)) },
            },
            { _id: 1 }
        );

        return docModels.length === docs.length;
    }

    async docIsPublic(docId: string): Promise<boolean> {
        const doc = await DocModel.findById(docId);

        return Boolean(doc && doc.public);
    }

    private verifyToken<TPayload = any>(token: string, publicKey: string) {
        return new Promise<TPayload>((resolve, reject) => {
            // @ts-ignore
            verify(token, publicKey, (err, payload: TPayload) => {
                if (err) {
                    return reject(err);
                }

                resolve(payload);
            });
        });
    }
}
