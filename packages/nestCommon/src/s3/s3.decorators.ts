import { Inject } from '@nestjs/common';

import { S3_CLIENT_TOKEN } from './constants';

export const S3Client = () => Inject(S3_CLIENT_TOKEN);
