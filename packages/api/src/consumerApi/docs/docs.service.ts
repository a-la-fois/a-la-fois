import { Doc } from '@a-la-fois/models';
import { Injectable } from '@nestjs/common';
import { DocModel } from '../../models';

@Injectable()
export class DocsService {
    async getDocsByIds(ids: string[], ownerId: string) {
        return await DocModel.find({
            owner: ownerId,
            _id: {
                $in: ids,
            },
        });
    }

    async createDoc(docParams: Pick<Doc, 'owner' | 'public'>) {
        const doc = await DocModel.create({
            owner: docParams.owner,
            public: docParams.public,
        });

        return doc.id;
    }
}
