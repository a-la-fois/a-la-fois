import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { IDecoder } from './types';

@Injectable()
export class ProtobufPipe implements PipeTransform {
    constructor(private decoder: IDecoder) {}

    transform(value: Uint8Array) {
        return this.decoder.decode(value);
    }
}
