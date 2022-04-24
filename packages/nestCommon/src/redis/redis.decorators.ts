import { Inject } from '@nestjs/common';

import { REDIS_CLIENT_TOKEN } from './constants';

export const RedisClient = () => Inject(REDIS_CLIENT_TOKEN);
