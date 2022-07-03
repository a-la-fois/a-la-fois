import { Module } from "@nestjs/common";

import { WsGateway } from './ws.gateway';
import { DocModule } from "../doc/doc.module";

@Module({
  imports: [DocModule],
  providers: [WsGateway],
})
export class WsModule {

}
