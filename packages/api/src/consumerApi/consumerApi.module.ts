import { Module } from '@nestjs/common';
import { DocsController } from './docs.controller';
import { DocsModule } from './docs';
import { ConsumerModule } from './consumer';
import { AuthController } from './auth.controller';
import { AuthModule } from 'src/auth';
import { KafkaService } from 'src/kafka/kafka.service';

@Module({
    controllers: [DocsController, AuthController],
    imports: [DocsModule, ConsumerModule, AuthModule],
    providers: [KafkaService],
})
export class ConsumerApiModule {}
