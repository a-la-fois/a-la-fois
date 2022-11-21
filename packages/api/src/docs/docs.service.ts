import { Doc as YDoc, encodeStateAsUpdate } from 'yjs';
import { v4 as uuidv4 } from 'uuid';
import { IDoc } from '@a-la-fois/doc-handler';
import { Inject, Injectable } from '@nestjs/common';
import { DocPublicDto } from './dto';
import { Model } from 'mongoose';

@Injectable()
export class DocsService {
    constructor(@Inject('DOC_MODEL') private readonly docModel: Model<IDoc>) {}

    async getDocsByIds(ids: string[]): Promise<DocPublicDto[]> {
        const docs = await this.docModel.find({
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
        const docStateBuffer = Buffer.from(encodeStateAsUpdate(new YDoc()).buffer);

        await this.docModel.create({
            docId,
            state: docStateBuffer,
        });

        return docId;
    }
}
