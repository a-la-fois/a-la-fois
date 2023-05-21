import { AccessData } from 'src/ws/types';
import { Message } from '../message';

export type UpdateTokenPayload = {
    token: string;
    docs: {
        added: AccessData[];
        changed: AccessData[];
        removed: string[];
    };
    message: string;
};

export const updateTokenType = 'updateToken';

export type UpdateTokenServiceMessage = Message<typeof updateTokenType, UpdateTokenPayload>;
