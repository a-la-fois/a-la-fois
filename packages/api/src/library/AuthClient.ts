import type { DaprClient, HttpMethod } from '@dapr/dapr';
import type {
    ResponseError,
    CheckClientTokenRequest,
    CheckClientTokenResponse,
    JWTPayload,
    DocIsPublicRequest,
    DocIsPublicResponse,
} from '../messages';

const serviceId = 'api';

export class AuthClient {
    constructor(private daprClient: DaprClient) {}

    async checkClientToken<TJWTPayload extends JWTPayload = JWTPayload>(jwt: string) {
        const requestPayload: CheckClientTokenRequest = {
            jwt,
        };

        try {
            const response = (await this.daprClient.invoker.invoke(
                serviceId,
                'checkClientToken',
                'post' as HttpMethod,
                requestPayload
            )) as any as CheckClientTokenResponse<TJWTPayload>;

            return response;
        } catch (err) {
            const error: ResponseError = {
                status: 500,
                error: 'Internal Server Error',
            };

            return error;
        }
    }

    async docIsPublic(docId: string) {
        const request: DocIsPublicRequest = {
            docId,
        };

        try {
            const response = (await this.daprClient.invoker.invoke(
                serviceId,
                'docIsPublic',
                'post' as HttpMethod,
                request
            )) as any as DocIsPublicResponse;

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
