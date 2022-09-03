import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActorService } from './actor.service';

@Module({
    imports: [ConfigModule],
    providers: [ActorService],
    exports: [ActorService],
})
export class ActorModule {}
