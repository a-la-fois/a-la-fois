import { Controller, Get, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ConsumerGuard, ConsumerService } from '../consumer';
import { DocsService } from './docs.service';
import { CreateDocDto, DocsByIdsDto, DocsByIdsQueryDto } from './dto';

@Controller('docs')
export class DocsController {
    constructor(private docsService: DocsService, private consumerService: ConsumerService) {}

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
    @UseGuards(ConsumerGuard)
    async createDoc(): Promise<CreateDocDto> {
        const consumer = await this.consumerService.getCurrentConsumer();

        const docId = await this.docsService.createDoc({
            // @ts-ignore
            owner: consumer._id,
        });

        return {
            id: docId,
        };
    }
}
