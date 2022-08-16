import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DaprClient, ActorProxyBuilder, ActorId } from '@dapr/dapr';
import { IDocHandler, DocHandler } from '@a-la-fois/doc-handler';

@Injectable()
export class DaprService {
  private readonly daprClient: DaprClient;
  private builder: ActorProxyBuilder<IDocHandler>;
  private actors: Map<string, IDocHandler> = new Map();

  constructor(
    private readonly configService: ConfigService
  ) {
    const daprHost = this.configService.get<string>('dapr.host');
    const daprPort = this.configService.get<string>('dapr.port');

    this.daprClient = new DaprClient(daprHost, daprPort);

    this.builder = new ActorProxyBuilder<IDocHandler>(DocHandler, this.daprClient);
  }

  sendChanges(key: string, changes: string) {
    let actor: IDocHandler = this.actors.get(key);

    if (!actor) {
      actor = this.createActor(key);
      this.actors.set(key, actor);
    }

    actor.applyDiff(changes);
  }

  private createActor(key: string): IDocHandler {
    return this.builder.build(new ActorId(key));
  }
}