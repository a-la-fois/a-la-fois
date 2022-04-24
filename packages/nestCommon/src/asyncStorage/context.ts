import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

import { AsyncStorageService } from './asyncStorage.service';
import { REQ_KEY, RES_KEY } from './constants';

@Injectable()
export class Context {
    constructor(private storage: AsyncStorageService) {}

    get req(): Request {
        return this.storage.getData<Request>(REQ_KEY);
    }

    get res(): Response {
        return this.storage.getData<Response>(RES_KEY);
    }

    get headers() {
        return this.req.headers;
    }
}
