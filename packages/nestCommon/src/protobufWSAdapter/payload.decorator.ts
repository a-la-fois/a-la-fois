import { MessageBody } from '@nestjs/websockets';
import { ProtobufPipe } from './protobuf.pipe';
import { IDecoder } from './types';

export const Payload = (decoder: IDecoder) =>
    MessageBody(new ProtobufPipe(decoder));
