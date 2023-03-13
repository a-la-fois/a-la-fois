import { Inject } from '@nestjs/common';

import { DAPR_CLIENT_TOKEN } from './constants';

export const DaprClient = () => Inject(DAPR_CLIENT_TOKEN);
