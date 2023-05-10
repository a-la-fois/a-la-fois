import { Doc } from '@a-la-fois/models';
import { Injectable } from '@nestjs/common';
import { DocModel } from '../../models';

@Injectable()
export class DocsService {
    async getDocsByIds(ids: string[]) {
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
