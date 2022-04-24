import { Module } from '@nestjs/common';

import { TldService } from './tld.service';

@Module({
    providers: [TldService],
    exports: [TldService],
})
export class TldModule {}
