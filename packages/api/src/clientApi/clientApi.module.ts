import { Module } from '@nestjs/common';
import { ClientModule } from './client';
import { HistoryModule } from './history';
import { HistoryController } from './history.controller';

@Module({
    controllers: [HistoryController],
    imports: [ClientModule, HistoryModule],
})
export class ClientApiModule {}
