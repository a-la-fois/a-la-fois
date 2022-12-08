import { Module } from '@nestjs/common';
import mongoose from 'mongoose';
import configuration from '../config';

const config = configuration();

const mongoConnect = (): Promise<typeof mongoose> => {
    const mongoConfig = config.mongo;
    let params: mongoose.ConnectOptions = { ssl: mongoConfig.ssl as boolean };

    if (mongoConfig.sslCA) {
        params['sslCA'] = mongoConfig.sslCA;
    }
    return mongoose.connect(mongoConfig.uri, params);
};

export const databaseProviders = [
    {
        provide: 'DATABASE_CONNECTION',
        useFactory: mongoConnect,
    },
];

@Module({
    providers: [...databaseProviders],
    exports: [...databaseProviders],
})
export class DbModule {}
