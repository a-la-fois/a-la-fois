import { Doc as YDoc, encodeStateAsUpdate } from 'yjs';
import { v4 as uuidv4 } from 'uuid';
import { DocModel, IDoc } from '@a-la-fois/doc-handler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DocsService {
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
