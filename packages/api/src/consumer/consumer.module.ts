import { Module } from '@nestjs/common';
import { Connection } from 'mongoose';
import { DbModule } from 'src/db/db.module';
import { ConsumerService } from './consumer.service';
import { ConsumerSchema } from './model';

export const consumerProviders = [
    {
        provide: 'CONSUMER_MODEL',
        useFactory: (connection: Connection) => connection.model('Consumers', ConsumerSchema),
        inject: ['DATABASE_CONNECTION'],
    },
];

@Module({
    imports: [DbModule],
    providers: [ConsumerService, ...consumerProviders],
    exports: [ConsumerService],
})
export class ConsumerModule {}
