import { Controller, Get, Module } from '@nestjs/common';

import { CookieModule } from '../../cookie.module';
import { CookieService } from '../../cookie.service';

@Controller('cookie')
class TestController {
    constructor(private cookieService: CookieService) {}

    @Get()
    async get() {
        const cookies = await this.cookieService.getCookies();

        return {
            cookies,
        };
    }
}

@Module({
    imports: [CookieModule],
    controllers: [TestController],
})
export class CookieServiceTestModule {}
