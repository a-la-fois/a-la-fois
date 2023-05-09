import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth';
import { ClientService } from './client.service';

@Module({
    imports: [AuthModule],
    exports: [ClientService],
    providers: [ClientService],
})
export class ClientModule {}
