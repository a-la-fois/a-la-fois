import { DaprClient } from '@dapr/dapr';
import { Injectable } from '@nestjs/common';
import { WebSocketConnection } from 'src/ws/types';
import { v4 as uuid } from 'uuid';
import { DaprClient as DaprClientDecorator } from '@a-la-fois/nest-common';
import { AuthClient } from '@a-la-fois/api';
import { TokenService } from './token.service';
import { createAccessObject } from './utils';

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
    private publicDocs: Map<string, boolean> = new Map();

    constructor(@DaprClientDecorator() daprClient: DaprClient, private readonly tokenService: TokenService) {
        this.authClient = new AuthClient(daprClient);
    }

    /*
     * The function changes client object
     * */
    async initClient(conn: WebSocketConnection, token?: string): Promise<AuthCheckResult> {
        conn.id = uuid();

        if (!token) {
            conn.access = {};
            return OK_RESULT;
        }

        const response = await this.authClient.checkClientToken(token);

        if (response.status !== 200) {
            return {
                status: 'err',
                message: 'invalid token',
            };
        }

        conn.userId = response.payload.userId;
        conn.tokenId = response.payload.tokenId;
        conn.access = createAccessObject(response.payload.docs);

        this.tokenService.addConnection(conn);

        return OK_RESULT;
    }

    /*
     * Changes client object
     * */
    async checkDocAccess(conn: WebSocketConnection, docId: string): Promise<AuthCheckResult> {
        const docAccess = conn.access[docId];

        if (!docAccess) {
            const response = await this.authClient.docIsPublic(docId);

            if (response.status !== 200) {
                return {
                    status: 'err',
                    message: 'Internal error',
                };
            }

            if (response.payload.isPublic) {
                this.publicDocs.set(docId, true);
                return OK_RESULT;
            } else {
                return UNAUTHORIZED_RESULT;
            }
        }

        if (docAccess.rights.includes('read')) {
            return OK_RESULT;
        }

        return UNAUTHORIZED_RESULT;
    }

    checkReadAccess(conn: WebSocketConnection, docId: string): AuthCheckResult {
        const docAccess = conn.access[docId];

        if (!docAccess) {
            return UNAUTHORIZED_RESULT;
        }

        if (docAccess.rights.includes('read') || this.publicDocs.has(docId)) {
            return OK_RESULT;
        }

        return UNAUTHORIZED_RESULT;
    }

    checkWriteAccess(conn: WebSocketConnection, docId: string): AuthCheckResult {
        const docAccess = conn.access[docId];

        if (!docAccess) {
            return UNAUTHORIZED_RESULT;
        }

        if (docAccess.rights.includes('write') || this.publicDocs.has(docId)) {
            return OK_RESULT;
        }

        return UNAUTHORIZED_RESULT;
    }

    disconnect(conn: WebSocketConnection) {
        this.tokenService.removeConnection(conn);
    }
}
