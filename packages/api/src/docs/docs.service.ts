import { Doc } from '@a-la-fois/models';
import { DocModel } from '../models';
import { Injectable } from '@nestjs/common';
import { DocPublicDto } from './dto';

@Injectable()
export class DocsService {
    constructor() {}

    async getDocsByIds(ids: string[]): Promise<DocPublicDto[]> {
        const docs = await DocModel.find({
            docId: {
                $in: ids,
            },
        });

        const docsPublic = docs.map(({ id, state }) => {
            return {
                id,
                state,
            };
        });

        return docsPublic;
    }

    async createDoc(docParams: Pick<Doc, 'owner' | 'public'>) {
        const doc = await DocModel.create({
            owner: docParams.owner,
            public: docParams.public,
        });

        return doc.id;
    }
}
