import { Controller, Get, Param, UnauthorizedException } from '@nestjs/common';
import { isDocument } from '@typegoose/typegoose';
import { DocModel } from '../models';
import { ClientService } from './client';
import { HistoryService } from './history';
import { GetHistoryResponse } from './types';
import { LoggerService } from '@a-la-fois/nest-common';

@Controller('history')
export class HistoryController {
    private logger: LoggerService;

    constructor(
        private historyService: HistoryService,
        private clientService: ClientService,
        loggerService: LoggerService,
    ) {
        this.logger = loggerService.child({ module: this.constructor.name });
    }

    /**
     * @deprecated
     */
    @Get(':docId')
    async getHistory(@Param('docId') docId: string): Promise<GetHistoryResponse> {
        const doc = await DocModel.findOne({ _id: docId }, { _id: 1, public: 1, owner: 1 });

        if (!doc) {
            this.logger.warn({ docId }, 'Get history is called on non existing document');
            throw new UnauthorizedException('Has no permission to access this document');
        }

        if (doc.public) {
            this.logger.info({ docId }, 'Get history of public ducument');
            return {
                history: await this.historyService.getHistorySerialized(docId),
            };
        }

        const clientCredentials = await this.clientService.getClientCredentials();

        if (!clientCredentials) {
            this.logger.warn({ docId }, 'Get history is called with invalid token');
            throw new UnauthorizedException('Has no permission to access this document');
        }

        const docOwnerId = isDocument(doc.owner) ? doc.owner._id.toString() : doc.owner.toString();

        if (clientCredentials.consumerId !== docOwnerId) {
            this.logger.warn(
                {
                    docId,
                    consumerId: clientCredentials.consumerId,
                    userId: clientCredentials.userId,
                    tokenId: clientCredentials.tokenId,
                },
                "Get history: cosumer doesn't own this document",
            );
            throw new UnauthorizedException('Has no permission to access this document');
        }

        const docPermissions = clientCredentials.docs?.find(
            (docPermissions) => docPermissions.id === docId && docPermissions.rights.includes('read'),
        );

        if (!docPermissions) {
            this.logger.warn(
                {
                    docId,
                    consumerId: clientCredentials.consumerId,
                    userId: clientCredentials.userId,
                    tokenId: clientCredentials.tokenId,
                },
                "Get history: user doesn't have access to this document",
            );
            throw new UnauthorizedException('Has no permission to access this document');
        }

        this.logger.info(
            {
                docId,
                consumerId: clientCredentials.consumerId,
                userId: clientCredentials.userId,
                tokenId: clientCredentials.tokenId,
            },
            'Get history',
        );
        return {
            history: await this.historyService.getHistorySerialized(docId),
        };
    }
}
