import { UseInterceptors } from '@nestjs/common';
import { ResponseEncodeInterceptor } from './responseEncode.interceptor';
import { IEncoder } from './types';

export const Response = (type: number, encoder: IEncoder) =>
    UseInterceptors(new ResponseEncodeInterceptor(type, encoder));
