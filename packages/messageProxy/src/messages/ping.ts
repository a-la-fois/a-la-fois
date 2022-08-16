import { Message } from './message';

export const pingEvent = 'ping';

export type PingMessage = Message<typeof pingEvent>;
