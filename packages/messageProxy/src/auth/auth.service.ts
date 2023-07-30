import { DaprClient } from '@dapr/dapr';
import { Injectable } from '@nestjs/common';
import { WebSocketConnection } from '../ws/types';
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

const INVALID_TOKEN_RESULT: AuthCheckResult = {
    status: 'err',
    message: 'Invalid token',
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

        return this.applyToken(conn, token);
    }

    async applyToken(conn: WebSocketConnection, token: string): Promise<AuthCheckResult> {
        const response = await this.authClient.checkClientToken(token);

        if (response.status !== 200) {
            return INVALID_TOKEN_RESULT;
        }

        conn.userId = response.payload.userId;
        conn.tokenId = response.payload.tokenId;

        if (response.payload.expiredAt) {
            conn.tokenExpiredAt = new Date(response.payload.expiredAt);
        }

        conn.access = createAccessObject(response.payload.docs);

        this.tokenService.addConnection(conn);

        return OK_RESULT;
    }

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

        if (docAccess && docAccess.rights.includes('read')) {
            return OK_RESULT;
        }

        if (this.publicDocs.has(docId)) {
            return OK_RESULT;
        }

        return UNAUTHORIZED_RESULT;
    }

    checkWriteAccess(conn: WebSocketConnection, docId: string): AuthCheckResult {
        const docAccess = conn.access[docId];

        if (docAccess && docAccess.rights.includes('write')) {
            return OK_RESULT;
        }

        if (this.publicDocs.has(docId)) {
            return OK_RESULT;
        }

        return UNAUTHORIZED_RESULT;
    }

    disconnect(conn: WebSocketConnection) {
        this.tokenService.removeConnection(conn);
    }
}
