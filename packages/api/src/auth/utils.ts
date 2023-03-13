import { safeParseJSON } from '../utils';

export const parseJWT = <TPayload = any>(jwt: string) => {
    const [_headers, payload, _sign] = jwt.split('.');

    if (!payload) {
        return null;
    }

    return safeParseJSON<TPayload>(Buffer.from(payload, 'base64').toString('utf8'));
};
