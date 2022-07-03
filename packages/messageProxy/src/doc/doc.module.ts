import { Module } from "@nestjs/common";
import { DocService } from "./doc.service";
import { PubsubModule } from '../pubsub/pubsub.module';

@Module({
    imports: [PubsubModule],
    providers: [DocService],
    exports: [DocService],
})
export class DocModule {}