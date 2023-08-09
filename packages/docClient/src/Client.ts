import { PossibleServiceEvent, serviceEvent, setTokenResponseEvent } from '@a-la-fois/message-proxy';
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

export type ServiceEvent = PossibleServiceEvent['data']['event'];
export type ServicePayload<EventName extends ServiceEvent> = Extract<
    PossibleServiceEvent['data'],
    { event: EventName }
>['data'];

export interface Client {
    once<EventName extends ServiceEvent>(
        event: EventName,
        listener: (payload: ServicePayload<EventName>) => void
    ): this;

    on<EventName extends ServiceEvent>(event: EventName, listener: (payload: ServicePayload<EventName>) => void): this;

    off<EventName extends ServiceEvent>(event: EventName, listener: (payload: ServicePayload<EventName>) => void): this;

    emit<EventName extends ServiceEvent>(event: EventName, payload: ServicePayload<EventName>): boolean;
}

export class Client extends EventEmitter<ServiceEvent, PossibleServiceEvent['data']> {
    private connection!: WsConnection;
    private ping!: Ping;
    private docs: Record<string, DocContainer> = {};
    private messenger!: Messenger;
    private api!: Api;

    constructor(private readonly config: ClientConfig) {
        super();
    }

    /**
     * Init connection to the server
     */
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
        this.messenger.off(serviceEvent, this.handleServiceEvent);
        this.disposeDocs();
    }

    async setToken(token: string) {
        this.assertConnection();
        this.messenger.sendSetToken({ token });
        const response = await this.messenger.waitFor(setTokenResponseEvent);

        if (response.status === 'err') {
            throw new Error(response.message);
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

    disposeDocs() {
        for (const docId in this.docs) {
            this.docs[docId].dispose();
        }

        this.docs = {};
    }

    private assertConnection() {
        if (!this.connection) {
            throw new Error('Connection not established');
        }
    }

    private handleServiceEvent = (payload: PossibleServiceEvent['data']) => {
        if (payload.event === 'expiredToken') {
            this.dispose();
        }
        this.emit<ServiceEvent>(payload.event, payload.data);
    };

    /* eslint-disable @typescript-eslint/no-explicit-any */
    // Following properties are from EventEmitter class and are declared to hide from docs
    /**
     * @hidden
     */
    static prefixed: any;
    /**
     * @hidden
     */
    eventNames: any;
    /**
     * @hidden
     */
    listeners: any;
    /**
     * @hidden
     */
    listenerCount: any;
    /**
     * @hidden
     */
    removeListener: any;
    /**
     * @hidden
     */
    removeAllListeners: any;
}
