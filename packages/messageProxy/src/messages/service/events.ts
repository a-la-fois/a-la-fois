import { TokenExpiredServiceMessage } from './tokenExpired';
import { UpdateTokenServiceMessage } from './updateToken';

export type PossibleServiceEvents = UpdateTokenServiceMessage | TokenExpiredServiceMessage;
