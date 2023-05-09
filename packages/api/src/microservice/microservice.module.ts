import { Module } from '@nestjs/common';
import { MicroserviceController } from './microservice.controller';
import { AuthModule } from '../auth';

@Module({
    controllers: [MicroserviceController],
    imports: [AuthModule],
})
export class MicroserviceModule {}
