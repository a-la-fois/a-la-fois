import { UpdateJWTPayload } from '../updateToken';
import { BroadcastMessage } from './broadcastMessage';

export const updateTokenBroadcastMessageType = 'updateToken';

export type UpdateTokenBroadcastPayload = {
    token: string;
    data: UpdateJWTPayload;
};

export type UpdateTokenBroadcastMessage = BroadcastMessage<
    typeof updateTokenBroadcastMessageType,
    UpdateTokenBroadcastPayload
>;
