import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WsModule } from './ws/ws.module';
import { DocModule } from './doc/doc.module';
import { ActorModule } from './actor/actor.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
        }),
        WsModule,
        DocModule,
        ActorModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
