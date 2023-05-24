import { PossibleServiceEvents, serviceEvent } from '@a-la-fois/message-proxy';
import EventEmitter from 'eventemitter3';
import { Api } from './Api';
import { DocContainer } from './DocContainer';
import { Messenger } from './Messenger';
import { Ping } from './Ping';
import { WsConnection } from './WsConnection';

export type ClientConfig = {
    url: string;
    apiUrl: string;
    token?: string;
};

export type ServiceEvent = PossibleServiceEvents['data']['event'];
export type ServicePayload = PossibleServiceEvents['data']['data'];

export interface Client {
    once(event: ServiceEvent, listener: (payload: ServicePayload) => void): this;

    on(event: ServiceEvent, listener: (payload: ServicePayload) => void): this;

    off(event: ServiceEvent, listener: (payload: ServicePayload) => void): this;

    emit(event: ServiceEvent, payload: ServicePayload): boolean;
}

export class Client extends EventEmitter<ServiceEvent, ServicePayload> {
    private connection!: WsConnection;
    private ping!: Ping;
    private docs: Record<string, DocContainer> = {};
    private messenger!: Messenger;
    private api!: Api;

    constructor(private readonly config: ClientConfig) {
        super();
    }

    async connect() {
        this.connection = new WsConnection({ url: this.config.url, token: this.config.token });
        this.ping = new Ping({ connection: this.connection });

        await this.connection.connect();

        this.messenger = new Messenger({ connection: this.connection });
        this.messenger.on(serviceEvent, this.handleServiceEvent);

        this.api = new Api({
            url: this.config.apiUrl,
            token: this.config.token,
        });

        this.ping.start();
    }

    dispose() {
        this.ping?.dispose();
        this.messenger?.dispose();
        this.connection?.dispose();

        for (const docId in this.docs) {
            this.docs[docId].dispose();
        }
    }

    async getDoc(id: string) {
        this.assertConnection();

        if (this.docs[id]) {
            return this.docs[id]!;
        }

        const doc = new DocContainer({ id, messenger: this.messenger, api: this.api });
        await doc.init();

        this.docs[id] = doc;

        return doc;
    }

    private assertConnection() {
        if (!this.connection) {
            throw new Error('Connection not established');
        }
    }

    private handleServiceEvent = (payload: PossibleServiceEvents['data']) => {
        if (payload.event === 'expiredToken') {
            this.dispose();
        }
        this.emit(payload.event, payload.data);
    };
}
