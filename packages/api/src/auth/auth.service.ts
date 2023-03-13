import { verify } from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { ConsumerModel } from '../models';
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
