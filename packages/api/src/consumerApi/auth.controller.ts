import { UpdateTokenBroadcastMessage } from '@a-la-fois/message-proxy';
import { BadRequestException, Body, Controller, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/auth';
import { KafkaService } from 'src/kafka/kafka.service';
import { UpdateJWTPayload } from 'src/messages';
import { TokenModel } from 'src/models';
import { ConsumerGuard, ConsumerService } from './consumer';

type UpdateTokenDto = {
    tokens: string[];
};

@Controller('auth')
@UseGuards(ConsumerGuard)
export class TokenController {
    constructor(
        private authService: AuthService,
        private consumerService: ConsumerService,
        private kafkaService: KafkaService
    ) {}

    @Post()
    async updateToken(@Body() { tokens }: UpdateTokenDto) {
        const consumer = await this.consumerService.getCurrentConsumer();
        const parsedTokens: { token: string; payload: UpdateJWTPayload }[] = [];

        for (const t of tokens) {
            const payload: UpdateJWTPayload = await this.authService.checkJWT(t);

            if (!payload) {
                throw new BadRequestException('Token is invalid');
            }

            if (!payload.docs) {
                throw new BadRequestException('No documents');
            }

            const consumerOwnsDocs = this.authService.consumerOwnsDocs(
                consumer.id,
                payload.docs.map((doc) => doc.id)
            );

            if (!consumerOwnsDocs) {
                throw new UnauthorizedException('You dont have permission to documents');
            }

            parsedTokens.push({
                token: t,
                payload: payload,
            });
        }

        for (const t of parsedTokens) {
            if (await TokenModel.findOne({ tokenId: t.payload.id, consumerId: t.payload.consumerId })) {
                console.log('Already updated');
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
                tokenId: t.payload.id,
                consumerId: t.payload.consumerId,
                userId: t.payload.userId,
                docs: t.payload.docs.map((doc) => doc.id),
                ...(t.payload.expiredAt && { expiredAt: t.payload.expiredAt }),
            });

            const message: UpdateTokenBroadcastMessage = {
                type: 'updateToken',
                message: {
                    token: t.token,
                    data: t.payload,
                },
            };

            this.kafkaService.publish(JSON.stringify(message));
        }
    }
}
