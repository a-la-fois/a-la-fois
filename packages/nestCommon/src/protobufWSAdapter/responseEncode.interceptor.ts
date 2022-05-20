import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { packMessage } from './lib/message';
import { IEncoder } from './types';

@Injectable()
export class ResponseEncodeInterceptor implements NestInterceptor {
    constructor(private type: number, private encoder: IEncoder) {}

    intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                const encodedData = this.encoder.encode(data).finish();

                return packMessage(this.type, encodedData);
            })
        );
    }
}
