import { Message } from '../message';
import { UpdateTokenPayload, updateTokenServiceEvent } from './updateToken';

export type PossibleServiceEvents = Message<typeof updateTokenServiceEvent, UpdateTokenPayload>;
