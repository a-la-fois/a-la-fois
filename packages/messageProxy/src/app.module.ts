import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WsModule } from "./ws/ws.module";
import { DocModule } from "./doc/doc.module";

@Module({
  imports: [WsModule, DocModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
