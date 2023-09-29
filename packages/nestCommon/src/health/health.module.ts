import { DynamicModule } from '@nestjs/common';
import { HealthController } from './health.controller';

export class HealthModule {
    static forRoot(): DynamicModule {
        return {
            controllers: [HealthController],
            module: HealthModule,
            global: true,
        };
    }
}
