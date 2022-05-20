import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ExternalModule } from './api/external';

@Module({
    imports: [ExternalModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
