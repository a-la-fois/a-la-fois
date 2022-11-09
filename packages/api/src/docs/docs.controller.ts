import { Controller, Post } from '@nestjs/common';
import { DocsService } from './docs.service';
import { CreateDocResponse } from './types';

@Controller('docs')
export class DocsController {
    constructor(private readonly docsService: DocsService) {}

    @Post()
    async createDoc(): Promise<CreateDocResponse> {
        const docId = await this.docsService.createDoc();

        return {
            id: docId,
        };
    }
}
