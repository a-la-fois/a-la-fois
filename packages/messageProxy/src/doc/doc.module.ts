import { Module } from '@nestjs/common';
import { DocService } from './doc.service';
import { PubsubModule } from '../pubsub/pubsub.module';
import { ActorModule } from '../actor/actor.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { PubsubService } from 'src/pubsub/pubsub.service';

@Module({
    imports: [PubsubModule, ActorModule, ConfigModule, AuthModule],
    providers: [DocService, PubsubService],
    exports: [DocService],
})
export class DocModule {}
