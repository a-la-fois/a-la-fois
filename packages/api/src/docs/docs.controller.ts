import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ConsumerGuard, ConsumerService } from '../consumer';
import { DocsService } from './docs.service';
import { CreateDocBodyDto, CreateDocDto, DocsByIdsDto, DocsByIdsQueryDto } from './dto';

@Controller('docs')
export class DocsController {
    constructor(private docsService: DocsService, private consumerService: ConsumerService) {}

    @Get()
    async getDocsByIds(@Query() { ids }: DocsByIdsQueryDto): Promise<DocsByIdsDto> {
        const docs = await this.docsService.getDocsByIds(ids);

        return {
            data: docs,
        };
    }

    @Post()
    @UseGuards(ConsumerGuard)
    async createDoc(@Body() docParams: CreateDocBodyDto): Promise<CreateDocDto> {
        const consumer = await this.consumerService.getCurrentConsumer();

        const docId = await this.docsService.createDoc({
            // @ts-ignore
            owner: consumer._id,
            public: docParams.public,
        });

        return {
            id: docId,
        };
    }
}
