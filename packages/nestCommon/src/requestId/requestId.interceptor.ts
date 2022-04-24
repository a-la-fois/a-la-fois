import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';

import { REQUEST_ID_CONFIG_TOKEN } from './constants';
import { RequestIdService } from './requestId.service';
import { RequestIdOptions } from './types';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
    constructor(
        private requestIdService: RequestIdService,
        @Inject(REQUEST_ID_CONFIG_TOKEN) private config: Required<RequestIdOptions>,
    ) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const res = context.switchToHttp().getResponse();

        const requestId = await this.requestIdService.getRequestId();
        res.set(this.config.headerName, requestId);

        return next.handle();
    }
}
