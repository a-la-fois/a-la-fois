import { Invoke } from '@a-la-fois/nest-common';
import { Controller } from '@nestjs/common';
import {
    CheckClientTokenRequest,
    CheckClientTokenResponse,
    DocIsPublicRequest,
    DocIsPublicResponse,
} from '../messages';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
    constructor(private authService: AuthService) {}

    @Invoke('checkClientToken', 'post')
    async checkClientToken(body: CheckClientTokenRequest): Promise<CheckClientTokenResponse> {
        const payload = await this.authService.checkJWT(body.jwt);

        if (!payload) {
            return {
                status: 401,
                error: 'Unauthorized',
            };
        }

        if (payload.docs && payload.docs.length > 0) {
            const result = await this.authService.consumerOwnsDocs(
                payload.consumerId,
                payload.docs.map((doc) => doc.id)
            );

            if (!result) {
                return {
                    status: 403,
                    error: 'Forbidden',
                };
            }
        }

        return {
            status: 200,
            payload,
        };
    }

    @Invoke('docIsPublic', 'post')
    async docIsPublic(body: DocIsPublicRequest): Promise<DocIsPublicResponse> {
        const result = await this.authService.docIsPublic(body.docId);

        return {
            status: 200,
            payload: {
                isPublic: result,
            },
        };
    }
}
