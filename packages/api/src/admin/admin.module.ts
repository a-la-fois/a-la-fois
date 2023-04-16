import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { SetupService } from './setup.service';

@Module({
    controllers: [AdminController],
    imports: [],
    exports: [],
    providers: [AdminGuard, AdminService, SetupService],
})
export class AdminModule {}
