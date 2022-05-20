import type { Writer } from 'protobufjs/minimal';

export interface IDecoder {
    decode(buffer: Uint8Array): any;
}

export interface IEncoder<TData = any> {
    encode(data: TData): Writer;
}
