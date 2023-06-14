import { AccessData } from '../../ws/types';
import { ServiceMessage } from './serviceMessage';

export type UpdateTokenPayload = {
    token: string;
    docs: {
        added: AccessData[];
        changed: AccessData[];
        unchanged: AccessData[];
        removed: string[];
    };
};

export const updateTokenServiceEvent = 'updateToken';

export type UpdateTokenServiceMessage = ServiceMessage<typeof updateTokenServiceEvent, UpdateTokenPayload>;
