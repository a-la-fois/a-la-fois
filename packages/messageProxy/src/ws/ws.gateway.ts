import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { v4 as uuidv4 } from 'uuid';

import { joinEvent, JoinPayload } from "./events/join";
import { changes, ChangesPayload } from "./events/changes";
import { closeEvent, ClosePayload } from "./events/close";
import { DocService } from "../doc/doc.service";
import { WebSocketClient } from './types';
import { IncomingMessage } from 'http';

@WebSocketGateway()
export class WsGateway implements OnGatewayConnection {
  constructor(private readonly docService: DocService) {}

  handleConnection(client: any, context: IncomingMessage) {
    client.id = uuidv4();
  }

  @SubscribeMessage(joinEvent)
  async onJoin(client: WebSocketClient, { docId }: JoinPayload) {
    this.docService.joinToDoc(client, docId);
  }

  @SubscribeMessage(changes)
  async onChanges(client: WebSocketClient, payload: ChangesPayload) {
    this.docService.applyDiff(client, payload);
  }


  @SubscribeMessage(closeEvent)
  async onClose(client: WebSocketClient, payload: ClosePayload) {
    // TODO
  }
}