import { pingEvent } from '@a-la-fois/message-proxy';
import { WsConnection } from './WsConnection';

export type PingConfig = {
    connection: WsConnection;
    timeout?: number;
};

const defaultConfig: Required<Omit<PingConfig, 'connection'>> = {
    timeout: 2000,
};

export class Ping {
    private readonly config: Required<PingConfig>;
    private timeoutId = 0;

    constructor(config: PingConfig) {
        this.config = {
            ...defaultConfig,
            ...config,
        };
    }

    start() {
        this.tick();
    }

    stop() {
        clearTimeout(this.timeoutId);
    }

    dispose() {
        this.stop();
    }

    private tick() {
        this.timeoutId = setTimeout(() => {
            this.config.connection.sendJson({
                event: pingEvent,
            });

            this.tick();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }, this.config.timeout) as any as number;
    }
}
