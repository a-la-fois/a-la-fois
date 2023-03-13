import { Module } from '@nestjs/common';
import { DaprClientModule } from '@a-la-fois/nest-common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WsModule } from './ws/ws.module';
import { DocModule } from './doc/doc.module';
import { ActorModule } from './actor/actor.module';
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
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
