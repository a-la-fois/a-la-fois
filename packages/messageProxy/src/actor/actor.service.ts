import { Injectable } from '@nestjs/common';
import { DaprClient, ActorProxyBuilder, ActorId } from '@dapr/dapr';
import { IDocHandler, DocHandler } from '@a-la-fois/doc-handler';
import { ChangesPayload, SyncCompletePayload, SyncResponsePayload, SyncStartPayload } from '../messages';
import { DaprClient as DaprClientDecorator } from '@a-la-fois/nest-common';
import { ActorConnectionError } from '../errors/actor';

@Injectable()
export class ActorService {
    private builder: ActorProxyBuilder<IDocHandler>;
    private actors: Map<string, IDocHandler> = new Map();

    constructor(@DaprClientDecorator() private readonly daprClient: DaprClient) {
        this.builder = new ActorProxyBuilder<IDocHandler>(DocHandler, this.daprClient);
    }

    async sendChanges(userId: string, payload: ChangesPayload) {
        const actor: IDocHandler = this.getOrCreateActor(payload.docId);

        try {
            await actor.applyDiff({
                changes: payload.changes,
                userId,
            });
        } catch (err) {
            throw new ActorConnectionError(payload.docId);
        }
    }

    async syncStart(payload: SyncStartPayload): Promise<SyncResponsePayload> {
        const actor: IDocHandler = this.getOrCreateActor(payload.docId);

        try {
            const response = await actor.syncStart({ vector: payload.vector });
            return {
                docId: payload.docId,
                vector: response.vector,
                changes: response.changes,
            };
        } catch (err) {
            throw new ActorConnectionError(payload.docId);
        }
    }

    async syncComplete(userId: string, payload: SyncCompletePayload) {
        const actor: IDocHandler = this.getOrCreateActor(payload.docId);

        try {
            await actor.syncComplete({
                changes: payload.changes,
                userId,
            });
        } catch (err) {
            throw new ActorConnectionError(payload.docId);
        }
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
