import { Module } from "@nestjs/common";

import { WsGateway } from './ws.gateway';

@Module({
  imports: [],
  providers: [WsGateway],
})
export class WsModule {

}
