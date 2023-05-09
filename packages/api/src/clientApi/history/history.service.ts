import { Injectable } from '@nestjs/common';
import { UpdateModel } from '../../models';

@Injectable()
export class HistoryService {
    async getHistory(docId: string) {
        return UpdateModel.find({ docId }).sort({ createdAt: -1 });
    }

    async getHistorySerialized(docId: string) {
        const updates = await this.getHistory(docId);

        return updates.map((update) => ({
            id: update._id.toString(),
            state: update.state.toString('base64'),
            userId: update.userId,
            createdAt: update.createdAt.toISOString(),
        }));
    }
}
