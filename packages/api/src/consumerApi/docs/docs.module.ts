import { Module } from '@nestjs/common';
import { DocsService } from './docs.service';

@Module({
    exports: [DocsService],
    providers: [DocsService],
})
export class DocsModule {}
