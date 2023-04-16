import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateConsumerDto, RegenerateKeysDto } from './dto';
import { Admin } from './admin.decorator';
import { SetupService } from './setup.service';

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
            privateKey: result.privateKey,
        };
    }

    @Post('regenerateKeys')
    async regenerateKeys(@Body() payload: RegenerateKeysDto) {
        const result = await this.adminService.regenerateKeys(payload.consumerId);

        return {
            id: result.consumer.id,
            name: result.consumer.name,
            privateKey: result.privateKey,
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
