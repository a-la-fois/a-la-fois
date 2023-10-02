import { BadRequestException, Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateConsumerDto, UpdateConsumerDto } from './dto';
import { SetupService, Admin, AdminService } from './admin';
import { LoggerService } from '@a-la-fois/nest-common';

@Admin()
@Controller('admin')
export class AdminController {
    private logger: LoggerService;
    constructor(private adminService: AdminService, private setupService: SetupService, loggerService: LoggerService) {
        this.logger = loggerService.child({ module: this.constructor.name });
    }

    @Post('consumer')
    async createConsumer(@Body() payload: CreateConsumerDto) {
        const result = await this.adminService.createConsumer(payload);

        this.logger.info({ consumerName: payload.name }, 'Consumer created');
        return {
            id: result.consumer.id,
            name: result.consumer.name,
            publicKey: result.consumer.publicKey,
        };
    }

    @Get('consumer/:id')
    async getConsumer(@Param('id') consumerId: string) {
        const result = await this.adminService.getConsumer(consumerId);

        if (!result) {
            this.logger.warn({ consumerId }, 'Non existing consumer accessed');
            throw new BadRequestException('No such consumer');
        }

        this.logger.info({ consumerId }, 'Consumer accessed');
        return {
            id: result.consumer.id,
            name: result.consumer.name,
            publicKey: result.consumer.publicKey,
        };
    }

    @Patch('consumer/:id')
    async updateConsumer(@Param('id') consumerId: string, @Body() payload: UpdateConsumerDto) {
        const result = await this.adminService.updateConsumer({ ...payload, consumerId });

        if (!result) {
            this.logger.warn({ consumerId }, 'Non existing consumer updated');
            throw new BadRequestException('No such consumer');
        }

        this.logger.info({ consumerId }, 'Consumer updated');
        return {
            id: result.consumer.id,
            name: result.consumer.name,
            publicKey: result.consumer.publicKey,
        };
    }

    @Post('publicDoc')
    async publicDoc() {
        const doc = await this.adminService.createPublicDoc();

        this.logger.info({}, 'Public doc created');
        return {
            id: doc.id,
        };
    }

    @Post('devSetup')
    async devSetup() {
        const result = await this.setupService.devSetup();

        this.logger.info({}, 'Development setup');
        return result;
    }
}
