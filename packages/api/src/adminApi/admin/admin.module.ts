import { Module } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { SetupService } from './setup.service';

@Module({
    exports: [AdminGuard, AdminService, SetupService],
    providers: [AdminGuard, AdminService, SetupService],
})
export class AdminModule {}
