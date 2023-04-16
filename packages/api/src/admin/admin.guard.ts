import { Injectable, CanActivate } from '@nestjs/common';
import { AdminService } from './admin.service';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private adminService: AdminService) {}

    canActivate() {
        return this.adminService.isAdmin();
    }
}
