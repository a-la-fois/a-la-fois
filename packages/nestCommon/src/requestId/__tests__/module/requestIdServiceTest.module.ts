import { Controller, Get, Module } from '@nestjs/common';

import { RequestIdService } from '../../requestId.service';

@Controller('test')
class TestController {
    constructor(private requestIdService: RequestIdService) {}

    @Get()
    async get() {
        const requestId = await this.requestIdService.getRequestId();

        return {
            requestId,
        };
    }
}

@Module({
    controllers: [TestController],
})
export class RequestIdServiceTestModule {}
