import { Injectable } from '@nestjs/common';
import { DaprClient, ActorProxyBuilder, ActorId } from '@dapr/dapr';
import { IDocHandler, DocHandler } from '@a-la-fois/doc-handler';
import { ChangesPayload, SyncCompletePayload, SyncResponsePayload, SyncStartPayload } from '../messages';
import { DaprClient as DaprClientDecorator } from '@a-la-fois/nest-common';

@Injectable()
export class ActorService {
    private builder: ActorProxyBuilder<IDocHandler>;
    private actors: Map<string, IDocHandler> = new Map();

    constructor(@DaprClientDecorator() private readonly daprClient: DaprClient) {
        this.builder = new ActorProxyBuilder<IDocHandler>(DocHandler, this.daprClient);
    }

    async sendChanges(userId: string, payload: ChangesPayload) {
        const actor: IDocHandler = this.getOrCreateActor(payload.docId);

        actor.applyDiff({
            changes: payload.changes,
            userId,
        });
    }

    async syncStart(payload: SyncStartPayload): Promise<SyncResponsePayload> {
        const actor: IDocHandler = this.getOrCreateActor(payload.docId);
        const response = await actor.syncStart({ vector: payload.vector });

        return {
            docId: payload.docId,
            vector: response.vector,
            changes: response.changes,
        };
    }

    async syncComplete(userId: string, payload: SyncCompletePayload) {
        const actor: IDocHandler = this.getOrCreateActor(payload.docId);
        actor.syncComplete({
            changes: payload.changes,
            userId,
        });
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
