import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { customAlphabet } from 'nanoid';

import { RequestIdService } from './requestId.service';
import { RequestIdOptions } from './types';
import { REQUEST_ID_CONFIG_TOKEN } from './constants';
import { RequestIdInterceptor } from './requestId.interceptor';

const genUId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

const defaultConfig = {
    headerName: 'x-request-id',
    uid: () => genUId(),
};

const buildModuleMetadata = (config?: RequestIdOptions): ModuleMetadata => {
    const configProvider = {
        provide: REQUEST_ID_CONFIG_TOKEN,
        useValue: {
            ...defaultConfig,
            ...config,
        },
    };

    return {
        imports: [],
        providers: [configProvider, RequestIdService, RequestIdInterceptor],
        exports: [configProvider, RequestIdService, RequestIdInterceptor],
    };
};

@Module(buildModuleMetadata())
export class RequestIdModule {
    static register(options?: RequestIdOptions): DynamicModule {
        return {
            ...buildModuleMetadata(options),
            module: RequestIdModule,
        };
    }

    static forRoot(options?: RequestIdOptions): DynamicModule {
        return {
            ...buildModuleMetadata(options),
            module: RequestIdModule,
            global: true,
        };
    }
}
