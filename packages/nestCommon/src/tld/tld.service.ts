import { isIP } from 'net';
import { parse } from 'url';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { Context, StorageMemoize } from '../asyncStorage';

@Injectable()
export class TldService {
    constructor(private context: Context) {}

    @StorageMemoize()
    getTld(): string | null {
        return TldService.parseTld(this.context.req);
    }

    static parseTld(req: Request): string | null {
        // взято из @yandex-int/express-tld
        let host = req.hostname || req.host || req.headers.host || null;

        if (!host) {
            return null;
        }

        host = parse('//' + host, false, true).hostname;

        if (!host || isIP(host)) {
            return null;
        }

        const parts = host.split('.');
        let tld = parts[parts.length - 1];
        const sld = parts[parts.length - 2];

        if (sld === 'com') {
            tld = 'com.' + tld;
        } else if (tld === 'il') {
            tld = sld + '.' + tld;
        }

        return tld;
    }
}
