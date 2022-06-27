import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { joinEvent, JoinPayload } from "./events/join";
import { broadcastChangesEvent, BroadcastChangesPayload } from "./events/changes";
import { closeEvent, ClosePayload } from "./events/close";

@WebSocketGateway()
export class WsGateway{
  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    console.log(data);
    return "hi there!";
  }

  @SubscribeMessage(joinEvent)
  async onJoin(client: any, { roomId }: JoinPayload) {
    // TODO
  }

  @SubscribeMessage(broadcastChangesEvent)
  async onChanges(client: any, payload: BroadcastChangesPayload) {
    // TODO
  }


  @SubscribeMessage(closeEvent)
  async onClose(client: any, payload: ClosePayload) {
    // TODO
  }
}