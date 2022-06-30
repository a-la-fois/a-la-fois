export type WSEvent = string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WSMessage<T = any> = {
    event: WSEvent;
    data?: T;
};