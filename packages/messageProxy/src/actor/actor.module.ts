import { Module } from '@nestjs/common';
import { ActorService } from './actor.service';

@Module({
    imports: [],
    providers: [ActorService],
    exports: [ActorService],
})
export class ActorModule {}
