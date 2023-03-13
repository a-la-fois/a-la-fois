import { Invoke } from '@a-la-fois/nest-common';
import { Controller } from '@nestjs/common';
import { CheckJWTRequest, CheckJWTResponse } from '../messages';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
    constructor(private authService: AuthService) {}

    @Invoke('checkJWT', 'post')
    async checkJWT(body: CheckJWTRequest): Promise<CheckJWTResponse> {
        const payload = await this.authService.checkJWT(body.jwt);

        if (!payload) {
            return {
                status: 401,
                error: 'Unauthorized',
            };
        }

        return {
            status: 200,
            payload,
        };
    }
}
