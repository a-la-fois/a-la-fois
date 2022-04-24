import { Controller, Get, Module, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { AsyncStorageService } from '../../asyncStorage.service';
import { REQ_KEY, RES_KEY } from '../../constants';

@Controller('asyncStorage')
class TestController {
    constructor(private asyncStorage: AsyncStorageService) {}

    @Get()
    async get(@Req() req: Request, @Res() res: Response) {
        res.json({
            req: req === this.asyncStorage.getData(REQ_KEY),
            res: res === this.asyncStorage.getData(RES_KEY),
        });
    }
}

@Module({
    imports: [],
    controllers: [TestController],
})
export class AsyncStorageServiceTestModule {}
