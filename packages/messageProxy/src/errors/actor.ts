import { MessageError } from './base';

export class ActorConnectionError extends MessageError {
    message = `Couldn't connect to an actor, try again.`;
}
