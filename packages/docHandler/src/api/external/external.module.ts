import { Module } from '@nestjs/common';
import { CreateDocModule } from 'src/useCases/createDoc';

import { ExternalController } from './external.controller';

@Module({
    controllers: [ExternalController],
    imports: [CreateDocModule],
})
export class ExternalModule {}
