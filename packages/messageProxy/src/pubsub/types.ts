import { Changes } from "../doc/types";

export type BroadcastMessage = {
  client: WebSocket;
  changes: Changes;
};