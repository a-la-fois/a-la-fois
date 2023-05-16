import { Message } from '..';

export const serviceEvent = 'serviceEvent';

export type ServiceMessage<TEvent extends string, TPayload = undefined> = Message<
    typeof serviceEvent,
    Message<TEvent, TPayload>
>;
