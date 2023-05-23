import { DynamicModule } from '@nestjs/common';
import { OPTIONS_TOKEN } from './constants';
import { KafkaService } from './kafka.service';
import { KafkaOptions } from './types';

export class KafkaModule {
    static forRoot(options: KafkaOptions): DynamicModule {
        const optionsProvider = {
            provide: OPTIONS_TOKEN,
            useValue: options,
        };

        return {
            module: KafkaModule,
            providers: [KafkaService, optionsProvider],
            exports: [KafkaService],
            global: true,
        };
    }
}
