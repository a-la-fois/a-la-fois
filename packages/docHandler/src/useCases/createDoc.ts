import { Injectable, Module } from '@nestjs/common';
import { DocService, CreateDocPayload } from 'src/entities/doc';

@Injectable()
export class CreateDoc {
    constructor(private docService: DocService) {}

    async exec(data: CreateDocPayload) {
        await this.docService.createDoc(data);

        return this.docService.createDoc(data);
    }
}

export { CreateDocPayload as Payload };

@Module({
    exports: [CreateDoc],
    providers: [CreateDoc],
})
export class CreateDocModule {}
