import { Module } from '@nestjs/common';
import { DocsController } from './docs.controller';
import { DocsModule } from './docs';
import { ConsumerModule } from './consumer';
import { TokenController } from './auth.controller';
import { AuthModule } from 'src/auth';
import { KafkaService } from 'src/kafka/kafka.service';

@Module({
    controllers: [DocsController, TokenController],
    imports: [DocsModule, ConsumerModule, AuthModule],
    providers: [KafkaService],
})
export class ConsumerApiModule {}
