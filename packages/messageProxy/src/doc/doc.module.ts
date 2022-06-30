import { Module } from "@nestjs/common";
import { DocService } from "./doc.service";

@Module({
    providers: [DocService],
    exports: [DocService],
})
export class DocModule {}