import { Controller, Get, ParseArrayPipe, Post, Query } from '@nestjs/common';
import { DocsService } from './docs.service';
import { CreateDocDto, DocsByIdsDto } from './dto';

@Controller('docs')
export class DocsController {
    constructor(private readonly docsService: DocsService) {}

    @Get()
    async getDocsByIds(
        @Query('ids', new ParseArrayPipe({ items: String }))
        ids: string[]
    ): Promise<DocsByIdsDto> {
        const docs = await this.docsService.getDocsByIds(ids);

        return {
            data: docs,
        };
    }

    @Post()
    async createDoc(): Promise<CreateDocDto> {
        const docId = await this.docsService.createDoc();

        return {
            id: docId,
        };
    }
}
