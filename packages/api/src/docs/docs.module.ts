import { Module } from '@nestjs/common';
import { DocsService } from './docs.service';
import { DocsController } from './docs.controller';
import { ConsumerModule } from '../consumer';

@Module({
    imports: [ConsumerModule],
    controllers: [DocsController],
    providers: [DocsService],
})
export class DocsModule {}
