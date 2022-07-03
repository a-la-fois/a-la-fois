import { Module } from "@nestjs/common";
import { PubsubService } from './pubsub.service';

@Module({
  imports: [],
  providers: [PubsubService],
  exports: [PubsubService],
})
export class PubsubModule {}