import { AccessData } from 'src/ws/types';
import { Message } from './message';

export type UpdateTokenPayload = {
    token: string;
    docs: {
        added: AccessData[];
        changed: AccessData[];
        removed: string[];
    };
};

export const updateTokenEvent = 'updateToken';

export type UpdateTokenEvent = Message<typeof updateTokenEvent, UpdateTokenPayload>;
