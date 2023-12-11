import { pino } from 'pino';

/*
    LOG_LEVEL can be from bigger level to smaller:
    'fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'
*/

export type LoggerOptions = {
    pretty: boolean;
    level: string;
    service: string;
    module: string;
};

const defaultOptions: LoggerOptions = {
    pretty: process.env.NODE_ENV === 'development',
    level: process.env.LOG_LEVEL ?? 'debug',
    service: '',
    module: '',
};

export const createLogger = (userOptions: Partial<LoggerOptions> = defaultOptions) => {
    const options = { ...defaultOptions, ...userOptions };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addOptions: any = {};

    if (options.pretty) {
        addOptions.transport = {
            target: 'pino-pretty',
        };
    }

    if (options.service) {
        addOptions.mixin = () => ({ service: options.service });
    }

    const logger = pino({
        ...addOptions,
        level: options.level,
        timestamp: () => `,"time":"${new Date().toISOString()}"`,
        formatters: {
            level(label: string) {
                return { log_level: label };
            },
        },
    });

    return logger;
};
