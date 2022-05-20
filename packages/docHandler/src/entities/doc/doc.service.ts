import { Injectable } from '@nestjs/common';

import { CreateDocPayload } from './doc.types';

@Injectable()
export class DocService {
    getById(id: string) {
        return {
            id,
        };
    }

    async createDoc(payload: CreateDocPayload) {}
}
