import { Module } from '@nestjs/common';
import { DocsController } from './docs.controller';
import { DocsModule } from './docs';
import { ConsumerModule } from './consumer';
import { TokenController } from './token.controller';
import { AuthModule } from 'src/auth';
import { PubsubModule } from 'src/pubsub/pubsub.module';

@Module({
    controllers: [DocsController, TokenController],
    imports: [DocsModule, ConsumerModule, AuthModule, PubsubModule],
    providers: [],
})
export class ConsumerApiModule {}
