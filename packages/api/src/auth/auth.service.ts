import { verify } from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';
import { ConsumerModel, DocModel, TokenModel } from '../models';
import { JWTPayload } from '../messages';
import { parseJWT } from './utils';

@Injectable()
export class AuthService {
    async checkJWT<TJWTPayload extends JWTPayload = JWTPayload>(jwt: string): Promise<TJWTPayload | null> {
        const jwtPayload = parseJWT<TJWTPayload>(jwt);
        const [_headers, _payload, sign] = jwt.split('.');

        if (!jwtPayload?.consumerId || !jwtPayload?.userId) {
            return null;
        }

        const consumer = await ConsumerModel.findById(jwtPayload.consumerId);

        if (!consumer) {
            return null;
        }

        if (jwtPayload.expiredAt && jwtPayload.expiredAt < new Date()) {
            return null;
        }

        try {
            const payload = await this.verifyToken<TJWTPayload>(jwt, consumer.publicKey);

            const token = await TokenModel.findOne({ hash: sign });

            // Token is updated, but a client is trying to connect with old one
            if (token && token.taint) {
                return null;
            } else {
                TokenModel.create({
                    hash: sign,
                    consumerId: consumer._id,
                    userId: payload.userId,
                    ...(payload.expiredAt && { expiredAt: payload.expiredAt }),
                    ...(payload.docs && { docs: payload.docs.map((d) => d.id) }),
                });
            }

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
