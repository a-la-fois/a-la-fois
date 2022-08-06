export type Message<TEvent extends string, TPayload = undefined> = TPayload extends undefined
    ? {
          event: TEvent;
      }
    : {
          event: TEvent;
          data: TPayload;
      };
