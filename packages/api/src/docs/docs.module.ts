import { Module } from '@nestjs/common';
import { DocsService } from './docs.service';
import { DocsController } from './docs.controller';

@Module({
  controllers: [DocsController],
  providers: [DocsService]
})
export class DocsModule {}
