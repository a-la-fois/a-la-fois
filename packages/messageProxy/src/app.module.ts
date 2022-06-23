import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WsModule } from "./ws/ws.module";

@Module({
  imports: [WsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
