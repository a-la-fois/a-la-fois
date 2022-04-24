import { Inject, Injectable } from '@nestjs/common';

import { Context, StorageMemoize } from '../asyncStorage';
import { REQUEST_ID_CONFIG_TOKEN } from './constants';
import { RequestIdOptions } from './types';

@Injectable()
export class RequestIdService {
    constructor(
        @Inject(REQUEST_ID_CONFIG_TOKEN) private config: Required<RequestIdOptions>,
        private context: Context,
    ) {}

    @StorageMemoize()
    getRequestId() {
        return (this.context.req.headers[this.config.headerName] as string) || this.config.uid();
    }
}
