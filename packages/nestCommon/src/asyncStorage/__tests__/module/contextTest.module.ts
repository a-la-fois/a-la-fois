import { Controller, Get, Module, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { Context } from '../../context';

@Controller('context')
class TestController {
    constructor(private context: Context) {}

    @Get()
    async get(@Req() req: Request, @Res() res: Response) {
        res.json({
            req: req === this.context.req,
            res: res === this.context.res,
            headers: this.context.headers,
        });
    }
}

@Module({
    imports: [],
    controllers: [TestController],
})
export class ContextTestModule {}
