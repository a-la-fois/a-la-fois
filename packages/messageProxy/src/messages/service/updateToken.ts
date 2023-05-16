export type UpdateTokenPayload = {
    token: string;
    message: string;
};

export const updateTokenType = 'updateToken';

export type UpdateTokenServiceMessage = ServiceMessage<typeof updateTokenType, UpdateTokenPayload>;
