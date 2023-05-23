import { Message } from '../message';

export const serviceEvent = 'service';

export type ServicePayload<TServiceEvent extends string, TPayload = undefined> = Message<TServiceEvent, TPayload>;

// Message in mesage
export type ServiceMessage<TEvent extends string, TPayload = undefined> = Message<
    typeof serviceEvent,
    ServicePayload<TEvent, TPayload>
>;
