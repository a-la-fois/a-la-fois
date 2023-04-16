import { UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

export const Admin = () => UseGuards(AdminGuard);
