import { Changes } from "../doc/types";
import { WebSocketClient } from '../ws/types';

export type BroadcastMessage = {
  author: WebSocketClient;
  changes: Changes;
};