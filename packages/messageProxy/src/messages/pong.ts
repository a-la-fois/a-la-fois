import { Message } from './message';

export const pongEvent = 'pong';

export type PongMessage = Message<typeof pongEvent>;
