import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { AsyncStorageService } from './asyncStorage.service';

@Injectable()
export class AsyncStorageMiddleware implements NestMiddleware<Request, Response> {
    constructor(private storageService: AsyncStorageService) {}

    use(req: Request, res: Response, next: NextFunction): void {
        const asyncStorage = this.storageService.getAsyncStorage();

        asyncStorage.run(AsyncStorageService.getInitialStore(req, res), () => {
            next();
        });
    }
}
