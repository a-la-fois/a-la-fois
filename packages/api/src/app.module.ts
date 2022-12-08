import { Module } from '@nestjs/common';
import { ConsumerModule } from './consumer/consumer.module';
import { DbModule } from './db/db.module';
import { DocsModule } from './docs/docs.module';

@Module({
    imports: [DocsModule, ConsumerModule, DbModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
