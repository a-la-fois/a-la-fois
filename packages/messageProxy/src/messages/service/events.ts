import { TokenExpiredServiceMessage } from './tokenExpired';
import { UpdateTokenServiceMessage } from './updateToken';

export type PossibleServiceEvent = UpdateTokenServiceMessage | TokenExpiredServiceMessage;
