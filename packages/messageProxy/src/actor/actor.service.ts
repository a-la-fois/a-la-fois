import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DaprClient, ActorProxyBuilder, ActorId } from '@dapr/dapr';
import { IDocHandler, DocHandler } from '@a-la-fois/doc-handler';
import { SyncResponseActorType } from '@a-la-fois/doc-handler';
import { ChangesPayload, SyncCompletePayload, SyncResponsePayload, SyncStartPayload } from '../messages';

@Injectable()
export class ActorService {
    private readonly actorClient: DaprClient;
    private builder: ActorProxyBuilder<IDocHandler>;
    private actors: Map<string, IDocHandler> = new Map();

    constructor(private readonly configService: ConfigService) {
        const daprHost = this.configService.get<string>('dapr.host');
        const daprPort = this.configService.get<string>('dapr.port');

        this.actorClient = new DaprClient(daprHost, daprPort);

        this.builder = new ActorProxyBuilder<IDocHandler>(DocHandler, this.actorClient);
    }

    async sendChanges(payload: ChangesPayload): Promise<void> {
        const actor: IDocHandler = this.getOrCreateActor(payload.docId);

        actor.applyDiff(payload.changes);
    }

    async syncStart(payload: SyncStartPayload): Promise<SyncResponsePayload> {
        const actor: IDocHandler = this.getOrCreateActor(payload.docId);

        const response: SyncResponseActorType = await actor.syncStart(payload.vector);
        return {
            docId: payload.docId,
            vector: response.vector,
            changes: response.changes,
        };
    }

    async syncComplete(payload: SyncCompletePayload): Promise<void> {
        const actor: IDocHandler = this.getOrCreateActor(payload.docId);
        actor.syncComplete(payload.changes);
    }

    private getOrCreateActor(key: string): IDocHandler {
        let actor: IDocHandler = this.actors.get(key);

        if (!actor) {
            actor = this.builder.build(new ActorId(key));
            this.actors.set(key, actor);
        }

        return actor;
    }
}
