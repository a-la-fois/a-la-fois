import { DocContainer } from './DocContainer';
import { Messenger } from './Messenger';
import { Ping } from './Ping';
import { WsConnection } from './WsConnection';

export type ClientConfig = {
    url: string;
    token?: string;
};

export class Client {
    private connection!: WsConnection;
    private ping!: Ping;
    private docs: Record<string, DocContainer> = {};
    private messenger!: Messenger;

    constructor(private readonly config: ClientConfig) {}

    async connect() {
        this.connection = new WsConnection({ url: this.config.url, token: this.config.token });
        this.ping = new Ping({ connection: this.connection });
        await this.connection.connect();
        this.messenger = new Messenger({ connection: this.connection });

        this.ping.start();
    }

    dispose() {
        this.ping?.dispose();
        this.connection?.dispose();
    }

    async getDoc(id: string) {
        this.assertConnection();

        if (this.docs[id]) {
            return this.docs[id]!;
        }

        const doc = new DocContainer({ id, messenger: this.messenger });
        await doc.init();

        this.docs[id] = doc;

        return doc;
    }

    async getAwareness() {
        // TODO
    }

    private assertConnection() {
        if (!this.connection) {
            throw new Error('Connection not established');
        }
    }
}
