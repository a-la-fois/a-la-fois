import { AccessData } from 'src/ws/types';
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

export type UpdateTokenServiceEvent = ServiceMessage<typeof updateTokenServiceEvent, UpdateTokenPayload>;
