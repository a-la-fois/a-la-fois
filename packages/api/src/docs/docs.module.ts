import { Module } from '@nestjs/common';
import { DocsService } from './docs.service';
import { DocsController } from './docs.controller';
import { AuthModule } from '../auth';

@Module({
    imports: [AuthModule],
    controllers: [DocsController],
    providers: [DocsService],
})
export class DocsModule {}
