import { BadRequestException, Body, Controller, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/auth';
import { KafkaService } from 'src/kafka/kafka.service';
import { TokenModel } from 'src/models';
import { ConsumerGuard, ConsumerService } from './consumer';

type UpdateTokenDto = {
    tokens: string[];
};

@Controller('auth')
@UseGuards(ConsumerGuard)
export class AuthController {
    constructor(
        private authService: AuthService,
        private consumerService: ConsumerService,
        private kafkaService: KafkaService
    ) {}

    @Post()
    async updateToken(@Body() { tokens }: UpdateTokenDto) {
        const consumer = await this.consumerService.getCurrentConsumer();
        const parsedTokens = [];

        for (const t of tokens) {
            const payload = await this.authService.checkJWT(t);

            if (!payload) {
                throw new BadRequestException('Token is invalid');
            }

            if (!payload.docs) {
                throw new BadRequestException('No documents');
            }

            const consumerOwnsDocs = this.authService.consumerOwnsDocs(
                consumer.id,
                payload.docs.map((d) => d.id)
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
            // Revoke all other tokens
            await TokenModel.updateMany(
                {
                    consumerId: t.payload.consumerId,
                    userId: t.payload.userId,
                    docs: { $in: t.payload.docs.map((d) => d.id) },
                    taint: false,
                },
                {
                    taint: true,
                }
            );

            this.kafkaService.publish(t);
        }
    }
}
