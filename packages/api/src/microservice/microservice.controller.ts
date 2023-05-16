import { Invoke } from '@a-la-fois/nest-common';
import { Controller } from '@nestjs/common';
import { AuthService } from '../auth';
import {
    CheckClientTokenRequest,
    CheckClientTokenResponse,
    DocIsPublicRequest,
    DocIsPublicResponse,
} from '../messages';
import { DocModel, TokenModel } from 'src/models';

@Controller()
export class MicroserviceController {
    constructor(private authService: AuthService) {}

    @Invoke('checkClientToken', 'post')
    async checkClientToken(body: CheckClientTokenRequest): Promise<CheckClientTokenResponse> {
        const payload = await this.authService.checkJWT(body.jwt);
        const [_headers, _payload, sign] = body.jwt.split('.');

        if (!payload) {
            return {
                status: 401,
                error: 'Unauthorized',
            };
        }

        if (payload.expiredAt && payload.expiredAt < new Date()) {
            return {
                status: 401,
                error: 'Unauthorized',
            };
        }

        if (!payload.userId) {
            return {
                status: 401,
                error: 'Unauthorized',
            };
        }

        if (payload.docs && payload.docs.length > 0) {
            const result = await this.authService.consumerOwnsDocs(
                payload.consumerId,
                payload.docs.map((doc) => doc.id)
            );

            if (!result) {
                return {
                    status: 403,
                    error: 'Forbidden',
                };
            }
        }

        const token = await TokenModel.findOne({ hash: sign });

        // Token is updated, but a client is trying to connect with old one
        if (!token) {
            TokenModel.create({
                hash: sign,
                consumerId: payload.consumerId,
                userId: payload.userId,
                docs: payload.docs.map((doc) => doc.id),
                ...(payload.expiredAt && { expiredAt: payload.expiredAt }),
            });
        } else if (token.taint) {
            return {
                status: 401,
                error: 'Unauthorized',
            };
        }

        return {
            status: 200,
            payload,
        };
    }

    @Invoke('docIsPublic', 'post')
    async docIsPublic(body: DocIsPublicRequest): Promise<DocIsPublicResponse> {
        const doc = await DocModel.findById(body.docId);

        return {
            status: 200,
            payload: {
                isPublic: Boolean(doc && doc.public),
            },
        };
    }
}
