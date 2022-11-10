import { Controller, Get, Post, Query, ValidationPipe } from '@nestjs/common';
import { DocsService } from './docs.service';
import { CreateDocDto, DocsByIdsDto, DocsByIdsQueryDto } from './dto';

@Controller('docs')
export class DocsController {
    constructor(private readonly docsService: DocsService) {}

    @Get()
    async getDocsByIds(
        @Query(new ValidationPipe({ transform: true }))
        { ids }: DocsByIdsQueryDto
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
