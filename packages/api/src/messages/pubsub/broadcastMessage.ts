export type BroadcastMessage<TType extends string, TPayload> = {
    type: TType;
    message: TPayload;
};
