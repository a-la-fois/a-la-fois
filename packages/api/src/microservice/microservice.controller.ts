import { Invoke, LoggerService } from '@a-la-fois/nest-common';
import { Controller } from '@nestjs/common';
import { AuthService } from '../auth';
import {
    CheckClientTokenRequest,
    CheckClientTokenResponse,
    DocIsPublicRequest,
    DocIsPublicResponse,
} from '../messages';
import { DocModel, TokenModel } from '../models';
import { TokenPayload } from '../auth';

@Controller()
export class MicroserviceController {
    private logger: LoggerService;
    constructor(private authService: AuthService, loggerService: LoggerService) {
        this.logger = loggerService.child({ module: this.constructor.name });
    }

    @Invoke('checkClientToken', 'post')
    async checkClientToken(body: CheckClientTokenRequest): Promise<CheckClientTokenResponse> {
        const payload = await this.authService.checkJWT(body.jwt);

        if (!payload) {
            this.logger.warn({ token: body.jwt }, 'Check client token: invalid token');
            return {
                status: 401,
                error: 'Unauthorized',
            };
        }

        const errors = await new TokenPayload(payload).validate();

        if (errors.length != 0) {
            this.logger.warn({ token: body.jwt }, 'Check client token: token validation error');
            return {
                status: 401,
                error: 'Unauthorized',
            };
        }

        if (payload.docs && payload.docs.length > 0) {
            const docIds = payload.docs.map((doc) => doc.id);
            const result = await this.authService.consumerOwnsDocs(payload.consumerId, docIds);

            if (!result) {
                this.logger.warn(
                    {
                        tokenId: payload.tokenId,
                        consumerId: payload.consumerId,
                        docIds: docIds,
                        userId: payload.userId,
                    },
                    "Check client token: consumer doesn't own these documents",
                );
                return {
                    status: 403,
                    error: 'Forbidden',
                };
            }
        }

        const token = await TokenModel.findOne({ tokenId: payload.tokenId, consumerId: payload.consumerId });

        // Token is updated, but a client is trying to connect with the old one
        if (!token) {
            TokenModel.create({
                tokenId: payload.tokenId,
                consumerId: payload.consumerId,
                userId: payload.userId,
                docs: payload.docs.map((doc) => doc.id),
                ...(payload.expiredAt && { expiredAt: payload.expiredAt }),
            });
        } else if (token.taint) {
            this.logger.warn(
                {
                    tokenId: payload.tokenId,
                    consumerId: payload.consumerId,
                    userId: payload.userId,
                },
                'Check client token: the token is tainted',
            );
            return {
                status: 401,
                error: 'Unauthorized',
            };
        }

        this.logger.warn(
            {
                tokenId: payload.tokenId,
                consumerId: payload.consumerId,
                userId: payload.userId,
            },
            'Check client token: success',
        );

        return {
            status: 200,
            payload,
        };
    }

    @Invoke('docIsPublic', 'post')
    async docIsPublic(body: DocIsPublicRequest): Promise<DocIsPublicResponse> {
        const doc = await DocModel.findById(body.docId);

        this.logger.warn(
            {
                docId: body.docId,
            },
            'Doc is public: success',
        );

        return {
            status: 200,
            payload: {
                isPublic: Boolean(doc && doc.public),
            },
        };
    }
}
