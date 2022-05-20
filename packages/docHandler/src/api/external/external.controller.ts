import { Body, Controller, Post } from '@nestjs/common';
import { CreateDoc } from 'src/useCases/createDoc';

import { CreateDocDto } from './dto';

@Controller('doc')
export class ExternalController {
    constructor(private readonly createDoc: CreateDoc) {}

    @Post()
    createDocHandler(@Body() body: CreateDocDto) {
        return this.createDoc.exec(body);
    }
}

export type CreateDocResponse = ReturnType<
    typeof ExternalController.prototype.createDocHandler
>;
