import { Module } from '@nestjs/common';
import { DocsController } from './docs.controller';
import { DocsModule } from './docs';
import { ConsumerModule } from './consumer';
import { TokenController } from './token.controller';
import { AuthModule } from '../auth';

@Module({
    controllers: [DocsController, TokenController],
    imports: [DocsModule, ConsumerModule, AuthModule],
    providers: [],
})
export class ConsumerApiModule {}
