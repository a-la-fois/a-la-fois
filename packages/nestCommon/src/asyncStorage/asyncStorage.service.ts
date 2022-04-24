import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

import { REQ_KEY, RES_KEY } from './constants';

@Injectable()
export class AsyncStorageService {
    private readonly asyncStore = new AsyncLocalStorage<Map<Symbol, unknown>>();

    static getInitialStore(req: Request, res: Response) {
        const map = new Map<Symbol, unknown>();
        map.set(REQ_KEY, req);
        map.set(RES_KEY, res);

        return map;
    }

    getAsyncStorage() {
        return this.asyncStore;
    }

    getData<TData = unknown>(key: Symbol): TData {
        return this.getStore().get(key) as TData;
    }

    setData<TData = unknown>(key: Symbol, value: TData) {
        this.getStore().set(key, value);
    }

    private getStore() {
        const store = this.asyncStore.getStore();

        if (!store) {
            throw new Error(
                'Стор отсутствует. Скорее всего не подключена asyncStorageMiddleware'
            );
        }

        return store;
    }
}
