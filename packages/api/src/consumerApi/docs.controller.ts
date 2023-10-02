import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ConsumerGuard, ConsumerService } from './consumer';
import { DocsService } from './docs';
import { CreateDocBodyDto, CreateDocDto, DocsByIdsDto, DocsByIdsQueryDto } from './dto';
import { LoggerService } from '@a-la-fois/nest-common';

@Controller('docs')
@UseGuards(ConsumerGuard)
export class DocsController {
    private logger: LoggerService;

    constructor(
        private docsService: DocsService,
        private consumerService: ConsumerService,
        loggerService: LoggerService,
    ) {
        this.logger = loggerService.child({ module: this.constructor.name });
    }

    @Get()
    async getDocsByIds(@Query() { ids }: DocsByIdsQueryDto): Promise<DocsByIdsDto> {
        const consumer = await this.consumerService.getCurrentConsumer();
        const docs = await this.docsService.getDocsByIds(ids, consumer.id);

        this.logger.info({ docIds: ids, cunsumer: consumer.name }, 'Get docs by id');
        return {
            data: docs.map((doc) => ({
                id: doc.id,
                public: doc.public,
                state: doc.state,
            })),
        };
    }

    @Post()
    async createDoc(@Body() docParams: CreateDocBodyDto): Promise<CreateDocDto> {
        const consumer = await this.consumerService.getCurrentConsumer();

        const docId = await this.docsService.createDoc({
            // @ts-ignore
            owner: consumer.id,
            public: docParams.public,
        });

        this.logger.info({ docId, consumer: consumer.name }, 'New doc created');
        return {
            id: docId,
        };
    }
}
