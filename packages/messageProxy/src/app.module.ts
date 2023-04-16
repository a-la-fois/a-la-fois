import { Module } from '@nestjs/common';
import { DaprClientModule } from '@a-la-fois/nest-common';
import { WsModule } from './ws';
import { DocModule } from './doc';
import { ActorModule } from './actor';
import { config } from './config';

@Module({
    imports: [
        WsModule,
        DocModule,
        ActorModule,
        DaprClientModule.forRoot({
            daprHost: config.dapr.host,
            daprPort: config.dapr.port,
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
