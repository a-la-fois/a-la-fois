import { Inject } from '@nestjs/common';

import { DAPR_SERVER_TOKEN } from './constants';

export const DaprServer = () => Inject(DAPR_SERVER_TOKEN);
