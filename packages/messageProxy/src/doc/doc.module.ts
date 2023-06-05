import { Module } from '@nestjs/common';
import { DocService } from './doc.service';
import { ActorModule } from '../actor/actor.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [ActorModule, AuthModule],
    providers: [DocService],
    exports: [DocService],
})
export class DocModule {}
