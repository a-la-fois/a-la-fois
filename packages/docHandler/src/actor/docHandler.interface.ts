// TODO: move it up to use in messageProxy
export interface DocHandlerActor {
  sync();
  applyDiff();
}