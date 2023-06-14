export type PubsubMessage<TType extends string, TPayload> = {
    type: TType;
    message: TPayload;
};
