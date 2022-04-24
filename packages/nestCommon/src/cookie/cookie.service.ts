import { Injectable } from '@nestjs/common';
import { parse } from 'cookie';

import { Context, StorageMemoize } from '../asyncStorage';

import { Cookies } from './types';

@Injectable()
export class CookieService {
    static parse(cookiesStr: string): Cookies {
        return parse(cookiesStr) || {};
    }

    constructor(private context: Context) {}

    @StorageMemoize()
    getCookies() {
        const cookiesStr = (this.context.headers['cookie'] || '') as string;

        return CookieService.parse(cookiesStr);
    }
}
