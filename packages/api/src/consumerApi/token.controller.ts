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
import { AuthService } from 'src/auth';
import { UpdateJWTPayload } from 'src/messages';
import { TokenModel } from 'src/models';
import { ConsumerGuard, ConsumerService } from './consumer';

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
                    data: { tokenId: payload.tokenId },
                });
            }

            if (!payload.docs) {
                throw new BadRequestException({
                    message: 'No documents',
                    data: { tokenId: payload.tokenId },
                });
            }

            if (payload.expiredAt && new Date(payload.expiredAt) < new Date()) {
                throw new BadRequestException({
                    message: 'Token expiration date must be in the future',
                    data: { tokenId: payload.tokenId },
                });
            }

            const consumerOwnsDocs = this.authService.consumerOwnsDocs(
                consumer.id,
                payload.docs.map((doc) => doc.id)
            );

            if (!consumerOwnsDocs) {
                throw new UnauthorizedException({
                    message: 'You dont have permission to documents',
                    data: { tokenId: payload.tokenId },
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
