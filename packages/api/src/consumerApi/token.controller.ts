import { Pubsub, PubsubDecorator, UpdateTokenPubsubMessage } from '@a-la-fois/pubsub';
import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Post,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from '../auth';
import { UpdateJWTPayload } from '../messages';
import { TokenModel } from '../models';
import { ConsumerGuard, ConsumerService } from './consumer';
import { TokenPayload } from 'src/auth';
import { LoggerService } from '@a-la-fois/nest-common';

type UpdateTokenDto = {
    tokens: string[];
};

@Controller('tokens')
@UseGuards(ConsumerGuard)
export class TokenController {
    private logger: LoggerService;
    constructor(
        @PubsubDecorator() private readonly pubsub: Pubsub,
        private authService: AuthService,
        private consumerService: ConsumerService,
        loggerService: LoggerService,
    ) {
        this.logger = loggerService.child({ module: this.constructor.name });
    }

    @Post()
    async updateToken(@Body() { tokens }: UpdateTokenDto) {
        const consumer = await this.consumerService.getCurrentConsumer();
        const parsedTokens: { token: string; payload: UpdateJWTPayload }[] = [];

        for (const t of tokens) {
            const payload: UpdateJWTPayload | null = await this.authService.checkJWT(t);

            if (!payload) {
                this.logger.warn({ consumer: consumer.name, token: t }, 'Update token: invalid token');
                throw new BadRequestException({
                    message: 'Token is invalid',
                    data: { token: t },
                });
            }

            const errors = await new TokenPayload(payload, true).validate();

            if (errors.length != 0) {
                this.logger.warn(
                    { validationErrors: errors, consumer: consumer.name, token: t },
                    'Update token: validation error',
                );
                throw new BadRequestException({
                    message: errors,
                    data: { token: t },
                });
            }

            const docIds = payload.docs.map((doc) => doc.id);
            const consumerOwnsDocs = await this.authService.consumerOwnsDocs(consumer.id, docIds);

            if (!consumerOwnsDocs) {
                this.logger.warn(
                    { docIds, consumer: consumer.name },
                    "Update token: Consumer doesn't have access to the documents",
                );
                throw new UnauthorizedException({
                    message: 'You dont have permission to documents',
                    data: { token: t },
                });
            }

            parsedTokens.push({
                token: t,
                payload: payload,
            });
        }

        for (const t of parsedTokens) {
            if (await TokenModel.findOne({ tokenId: t.payload.tokenId, consumerId: t.payload.consumerId })) {
                this.logger.warn(
                    { tokenId: t.payload.tokenId, consumer: consumer.name },
                    'Update token: token with such tokendId already exists',
                );

                throw new ConflictException({
                    message: 'token with such tokenId already exists',
                    data: { tokenId: t.payload.tokenId },
                });
            }

            // Revoke all other tokens
            await TokenModel.updateMany(
                {
                    tokenId: t.payload.oldTokenId,
                    consumerId: t.payload.consumerId,
                    taint: false,
                },
                {
                    taint: true,
                },
            );

            await TokenModel.create({
                tokenId: t.payload.tokenId,
                consumerId: t.payload.consumerId,
                userId: t.payload.userId,
                ...(t.payload.expiredAt && { expiredAt: t.payload.expiredAt }),
            });

            const message: UpdateTokenPubsubMessage = {
                type: 'updateToken',
                message: {
                    token: t.token,
                    data: t.payload,
                },
            };

            this.pubsub.publish(message);
            this.logger.debug(
                { tokenId: t.payload.tokenId, consumer: consumer.name },
                'Update token: token is updated and sent to message proxy',
            );
        }

        this.logger.info({ consumer: consumer.name }, 'Update token: success');
        return { status: 'ok' };
    }
}
