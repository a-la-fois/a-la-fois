import type { DaprClient, HttpMethod } from '@dapr/dapr';
import type { ResponseError, CheckJWTRequest, CheckJWTResponse, JWTPayload } from '../messages';

const serviceId = 'api';

export class AuthClient {
    constructor(private daprClient: DaprClient) {}

    async checkJWT<TJWTPayload extends JWTPayload = JWTPayload>(jwt: string) {
        const requestPayload: CheckJWTRequest = {
            jwt,
        };

        try {
            const response = (await this.daprClient.invoker.invoke(
                serviceId,
                'checkJWT',
                'post' as HttpMethod,
                requestPayload
            )) as any as CheckJWTResponse<TJWTPayload>;

            return response;
        } catch (err) {
            const error: ResponseError = {
                status: 500,
                error: 'Internal Server Error',
            };

            return error;
        }
    }
}
