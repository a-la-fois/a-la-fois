import { AuthClient } from '@a-la-fois/api';
import { DaprClient } from '@dapr/dapr';
import { Injectable } from '@nestjs/common';
import { ClientJWTPayload, WebSocketClient } from './types';
import { v4 as uuid } from 'uuid';
import { DaprClient as DaprClientDecorator } from '@a-la-fois/nest-common';

export type AuthCheckResult = {
    status: 'ok' | 'err';
    message?: string;
};

const UNAUTHORIZED_RESULT: AuthCheckResult = {
    status: 'err',
    message: 'Unauthorized',
};

const OK_RESULT: AuthCheckResult = { status: 'ok' };

@Injectable()
export class AuthService {
    private authClient: AuthClient;

    constructor(@DaprClientDecorator() daprClient: DaprClient) {
        this.authClient = new AuthClient(daprClient);
    }

    /*
     * Changes client object
     * */
    async initClient(client: WebSocketClient, token?: string): Promise<AuthCheckResult> {
        client.id = uuid();

        if (!token) {
            client.access = {};
            return OK_RESULT;
        }

        const response = await this.authClient.checkClientToken<ClientJWTPayload>(token);

        if (response.status !== 200) {
            return {
                status: 'err',
                message: 'invalid token',
            };
        }

        client.userId = response.payload.userId;
        client.access =
            response.payload.docs?.reduce((acc, doc) => {
                acc[doc.id] = {
                    id: doc.id,
                    rights: doc.rights,
                    isPublic: doc.isPublic,
                };

                return acc;
            }, {} as WebSocketClient['access']) ?? {};

        return OK_RESULT;
    }

    /*
     * Changes client object
     * */
    async checkDocRights(client: WebSocketClient, docId: string): Promise<AuthCheckResult> {
        const docAccess = client.access[docId];

        if (!docAccess) {
            const response = await this.authClient.docIsPublic(docId);

            if (response.status !== 200) {
                return {
                    status: 'err',
                    message: 'Internal error',
                };
            }

            if (response.payload.isPublic) {
                client.access[docId]['isPublic'] == true;
            } else {
                return UNAUTHORIZED_RESULT;
            }
        }

        if (docAccess.rights.includes('noAccess')) {
            return UNAUTHORIZED_RESULT;
        }

        return OK_RESULT;
    }

    checkWriteAccess(client: WebSocketClient, docId: string): AuthCheckResult {
        const docAccess = client.access[docId];

        if (!docAccess.isPublic || !docAccess.rights.includes('write')) {
            return UNAUTHORIZED_RESULT;
        }

        return OK_RESULT;
    }
}
