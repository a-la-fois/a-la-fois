import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminModule } from './admin';

@Module({
    controllers: [AdminController],
    imports: [AdminModule],
})
export class AdminApiModule {}
