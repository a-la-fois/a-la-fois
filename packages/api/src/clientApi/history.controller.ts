import { Controller, Get, Param, UnauthorizedException } from '@nestjs/common';
import { isDocument } from '@typegoose/typegoose';
import { DocModel } from '../models';
import { ClientService } from './client';
import { HistoryService } from './history';
import { GetHistoryResponse } from './types';

@Controller('history')
export class HistoryController {
    constructor(private historyService: HistoryService, private clientService: ClientService) {}

    /**
     * @deprecated
     */
    @Get(':docId')
    async getHistory(@Param('docId') docId: string): Promise<GetHistoryResponse> {
        const doc = await DocModel.findOne({ _id: docId }, { _id: 1, public: 1, owner: 1 });

        if (!doc) {
            throw new UnauthorizedException('Has no permission to access this document');
        }

        if (doc.public) {
            return {
                history: await this.historyService.getHistorySerialized(docId),
            };
        }

        const clientCredentials = await this.clientService.getClientCredentials();

        if (!clientCredentials) {
            throw new UnauthorizedException('Has no permission to access this document');
        }

        const docOwnerId = isDocument(doc.owner) ? doc.owner._id.toString() : doc.owner.toString();

        if (clientCredentials.consumerId !== docOwnerId) {
            throw new UnauthorizedException('Has no permission to access this document');
        }

        const docPermissions = clientCredentials.docs?.find(
            (docPermissions) => docPermissions.id === docId && docPermissions.rights.includes('read')
        );

        if (!docPermissions) {
            throw new UnauthorizedException('Has no permission to access this document');
        }

        return {
            history: await this.historyService.getHistorySerialized(docId),
        };
    }
}
