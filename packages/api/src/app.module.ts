import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConsumerExtractorMiddleware } from './auth/consumerExtractor.middleware';
import { ConsumerModule } from './consumer/consumer.module';
import { DbModule } from './db/db.module';
import { DocsModule } from './docs/docs.module';

@Module({
    imports: [DocsModule, ConsumerModule, DbModule],
    controllers: [],
    providers: [],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ConsumerExtractorMiddleware).forRoutes('docs');
    }
}
