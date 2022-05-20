import { Module } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { HeroById, Hero } from '../../proto/hero';
import { Payload } from '../payload.decorator';
import { Response } from '../response.decorator';

export const heroRequestType = 1;
export const heroResponseType = 2;

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
class TestGateway {
    @SubscribeMessage(heroRequestType)
    @Response(heroResponseType, Hero)
    testEvent(@Payload(HeroById) data: HeroById) {
        return {
            id: data.id,
            name: 'Super batman',
        };
    }
}

@Module({
    providers: [TestGateway],
})
export class ProtobufWsAdapterTestModule {}
