import { Module } from '@nestjs/common';
import { AsyncStorageModule } from '@a-la-fois/nest-common';
import { DocsModule } from './docs/docs.module';
import { DbModule } from './db';

@Module({
    imports: [DocsModule, DbModule.forRoot(), AsyncStorageModule.forRoot()],
    controllers: [],
    providers: [],
})
export class AppModule {}
