import { Module } from '@nestjs/common';

import { WsGateway } from './ws.gateway';
import { DocModule } from '../doc/doc.module';
import { AuthService } from './auth.service';
import { KafkaPubsubService, KafkaPubSubToken } from 'src/pubsub/kafka-pubsub.service';

@Module({
    imports: [DocModule],
    providers: [
        WsGateway,
        AuthService,
        {
            provide: KafkaPubSubToken,
            useClass: KafkaPubsubService,
        },
    ],
})
export class WsModule {}
