import { Module } from '@nestjs/common';

import { WsGateway } from './ws.gateway';
import { DocModule } from '../doc/doc.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [DocModule, AuthModule],
    providers: [WsGateway],
})
export class WsModule {}
