import { JWTPayload } from '@a-la-fois/api';
import { AccessData, WebSocketConnection } from '../ws/types';

export const createAccessObject = (docs: JWTPayload['docs']): Record<string, AccessData> => {
    return (
        docs.reduce((acc, doc) => {
            acc[doc.id] = {
                id: doc.id,
                rights: doc.rights,
            };

            return acc;
        }, {} as WebSocketConnection['access']) ?? {}
    );
};
