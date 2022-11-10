import { Doc as YDoc, encodeStateAsUpdate } from 'yjs';
import { v4 as uuidv4 } from 'uuid';
import { DocModel, IDoc } from '@a-la-fois/doc-handler';
import { Injectable } from '@nestjs/common';
import { DocPublicDto } from './dto';

@Injectable()
export class DocsService {
    async getDocsByIds(ids: string[]): Promise<DocPublicDto[]> {
        const docs = await DocModel.find({
            docId: {
                $in: ids,
            },
        });

        const docsPublic = docs.map(({ docId, state }) => {
            return {
                id: docId,
                state,
            };
        });

        return docsPublic;
    }

    async createDoc(): Promise<IDoc['docId']> {
        const docId = uuidv4();
        const docStateBuffer = Buffer.from(
            encodeStateAsUpdate(new YDoc()).buffer
        );

        await DocModel.create({
            docId,
            state: docStateBuffer,
        });

        return docId;
    }
}
