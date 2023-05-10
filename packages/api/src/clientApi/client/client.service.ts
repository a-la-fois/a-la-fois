import { AsyncStorageService, REQ_KEY, StorageMemoize } from '@a-la-fois/nest-common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth';

const CLIENT_KEY = Symbol('CLIENT_KEY');

@Injectable()
export class ClientService {
    constructor(private storageService: AsyncStorageService, private authService: AuthService) {}

    @StorageMemoize(CLIENT_KEY)
    async getClientCredentials() {
        const token = this.storageService.getData<Request>(REQ_KEY).headers['authorization'];

        if (!token) {
            return null;
        }

        const payload = await this.authService.checkJWT(token);

        if (!payload) {
            throw new UnauthorizedException('JWT token is not valid.');
        }

        return payload;
    }
}
