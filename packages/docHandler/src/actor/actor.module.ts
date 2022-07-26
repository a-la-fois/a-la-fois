import { Module } from '@nestjs/common';
import { ActorService } from './actor.service';

@Module({
  providers: [ActorService],
  exports: [ActorService],
})
export class ActorModule {}