import { Controller, Get, Module, UseInterceptors } from '@nestjs/common';

import { RequestIdInterceptor } from '../../requestId.interceptor';

@Controller('test')
@UseInterceptors(RequestIdInterceptor)
class TestController {
    @Get()
    async get() {
        return {
            foo: 'bar',
        };
    }
}

@Module({
    controllers: [TestController],
})
export class RequestIdInterceptorTestModule {}
