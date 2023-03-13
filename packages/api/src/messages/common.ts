export type ResponseSuccess<TPayload> = {
    status: 200;
    payload: TPayload;
};

export type ResponseError = {
    status: 400 | 401 | 403 | 404 | 500;
    error: string;
};

export type Response<TPayload> = ResponseSuccess<TPayload> | ResponseError;
