import { Controller, Get, Injectable, Module } from '@nestjs/common';

import { StorageMemoize } from '../../storageMemoize.decorator';

@Injectable()
class Service {
    @StorageMemoize()
    method1() {
        const hrTime = process.hrtime();

        return hrTime[0] * 1000000 + hrTime[1] / 1000;
    }
}

@Controller('storageMemoize')
class TestController {
    constructor(private service: Service) {}

    @Get('method1')
    async get() {
        return {
            result1: this.service.method1(),
            result2: this.service.method1(),
        };
    }
}

@Module({
    providers: [Service],
    controllers: [TestController],
})
export class StorageMemoizeTestModule {}
