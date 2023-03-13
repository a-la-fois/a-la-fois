import { DynamicModule } from '@nestjs/common';
import mongoose, { ConnectOptions } from 'mongoose';
import { config } from '../config';

const mongoConnect = () => {
    const mongoConfig = config.mongo;
    const params: ConnectOptions = { ssl: mongoConfig.ssl };

    if (mongoConfig.sslCA) {
        params['sslCA'] = mongoConfig.sslCA;
    }
    return mongoose.connect(mongoConfig.uri, params);
};

export class DbModule {
    static forRoot(): DynamicModule {
        mongoConnect();

        return {
            module: DbModule,
            global: true,
        };
    }
}
