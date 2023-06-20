import { BadRequestException, Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateConsumerDto, UpdateConsumerDto } from './dto';
import { SetupService, Admin, AdminService } from './admin';

@Admin()
@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService, private setupService: SetupService) {}

    @Post('consumer')
    async createConsumer(@Body() payload: CreateConsumerDto) {
        const result = await this.adminService.createConsumer(payload);

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
            throw new BadRequestException('No such consumer');
        }

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
            throw new BadRequestException('No such consumer');
        }

        return {
            id: result.consumer.id,
            name: result.consumer.name,
            publicKey: result.consumer.publicKey,
        };
    }

    @Post('publicDoc')
    async publicDoc() {
        const doc = await this.adminService.createPublicDoc();

        return {
            id: doc.id,
        };
    }

    @Post('devSetup')
    async devSetup() {
        const result = await this.setupService.devSetup();

        return result;
    }
}
