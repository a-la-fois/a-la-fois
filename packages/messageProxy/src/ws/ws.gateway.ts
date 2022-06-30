import {
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { joinEvent, JoinPayload } from "./events/join";
import { changes, ChangesPayload } from "./events/changes";
import { closeEvent, ClosePayload } from "./events/close";
import { DocService } from "../doc/doc.service";

@WebSocketGateway()
export class WsGateway {
  constructor(private readonly docService: DocService) {
  }

  @SubscribeMessage(joinEvent)
  async onJoin(client: any, { docId }: JoinPayload) {
    this.docService.joinToDoc(client, docId);
  }

  @SubscribeMessage(changes)
  async onChanges(client: any, payload: ChangesPayload) {
    this.docService.applyDiff(client, payload);
  }


  @SubscribeMessage(closeEvent)
  async onClose(client: any, payload: ClosePayload) {
    // TODO
  }
}