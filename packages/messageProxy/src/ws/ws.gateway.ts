import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

@WebSocketGateway()
export class WsGateway{
  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }

}