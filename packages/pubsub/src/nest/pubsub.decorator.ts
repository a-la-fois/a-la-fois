import { Inject } from '@nestjs/common';
import { PUBSUB_TOKEN } from './constants';

export const PubsubDecorator = () => Inject(PUBSUB_TOKEN);
