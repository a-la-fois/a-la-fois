import Redis from 'ioredis';

import { RedisOptions } from './types';

export const createClient = (options: RedisOptions) => {
    return new Redis(options);
};
