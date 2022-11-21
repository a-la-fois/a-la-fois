import { Module } from '@nestjs/common';
import mongoose from 'mongoose';
import configuration from '../config';

const config = configuration();

export const databaseProviders = [
    {
        provide: 'DATABASE_CONNECTION',
        useFactory: (): Promise<typeof mongoose> => mongoose.connect(config.mongo.uri),
    },
];

@Module({
    providers: [...databaseProviders],
    exports: [...databaseProviders],
})
export class DbModule {}
