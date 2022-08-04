import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DaprService } from './dapr.service';

@Module({
  imports: [ConfigModule],
  providers: [DaprService],
  exports: [DaprService],
})
export class DaprModule {}