import { Controller } from '@nestjs/common';
import { DocsService } from './docs.service';

@Controller('api/docs')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}
}
