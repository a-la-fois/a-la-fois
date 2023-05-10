import { Module } from '@nestjs/common';
import { DocsController } from './docs.controller';
import { DocsModule } from './docs';
import { ConsumerModule } from './consumer';

@Module({
    controllers: [DocsController],
    imports: [DocsModule, ConsumerModule],
})
export class ConsumerApiModule {}
