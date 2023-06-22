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

type UpdateTokenDto = {
    tokens: string[];
};

@Controller('tokens')
@UseGuards(ConsumerGuard)
export class TokenController {
    constructor(
        @PubsubDecorator() private readonly pubsub: Pubsub,
        private authService: AuthService,
        private consumerService: ConsumerService
    ) {}

    @Post()
    async updateToken(@Body() { tokens }: UpdateTokenDto) {
        const consumer = await this.consumerService.getCurrentConsumer();
        const parsedTokens: { token: string; payload: UpdateJWTPayload }[] = [];

        for (const t of tokens) {
            const payload: UpdateJWTPayload = await this.authService.checkJWT(t);

            if (!payload) {
                throw new BadRequestException({
                    message: 'Token is invalid',
                    data: { token: t },
                });
            }

            const errors = await new TokenPayload(payload, true).validate();

            if (errors.length != 0) {
                throw new BadRequestException({
                    message: errors,
                    data: { token: t },
                });
            }

            const consumerOwnsDocs = this.authService.consumerOwnsDocs(
                consumer.id,
                payload.docs.map((doc) => doc.id)
            );

            if (!consumerOwnsDocs) {
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
                }
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
        }

        return { status: 'ok' };
    }
}
