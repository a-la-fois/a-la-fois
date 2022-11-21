import { Module } from '@nestjs/common';
import { DocsService } from './docs.service';
import { DocSchema } from '@a-la-fois/doc-handler';
import { DocsController } from './docs.controller';
import { Connection } from 'mongoose';
import { DbModule } from '../db/db.module';

export const docProviders = [
    {
        provide: 'DOC_MODEL',
        useFactory: (connection: Connection) => connection.model('Docs', DocSchema),
        inject: ['DATABASE_CONNECTION'],
    },
];

@Module({
    imports: [DbModule],
    controllers: [DocsController],
    providers: [DocsService, ...docProviders],
})
export class DocsModule {}
