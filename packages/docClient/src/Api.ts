import { ClientApi } from '@a-la-fois/api';

export type ApiConfig = {
    url: string;
    token?: string;
};

export class Api {
    private url: string;
    private token?: string;

    constructor(config: ApiConfig) {
        this.url = config.url;
        this.token = config.token;
    }

    async getHistory(docId: string) {
        return this.get<ClientApi['GetHistoryResponse']>(`/history/${docId}`);
    }

    async get<TBody extends Object>(path: string) {
        const headers = this.token ? { Authorization: this.token } : ({} as {});

        const result = await fetch(`${this.url}${path}`, {
            headers,
        });

        if (!result.ok) {
            const errorBody = await result.json();

            throw new Error(errorBody.message);
        }

        return (await result.json()) as TBody;
    }
}
