import { AbstractActor } from '@dapr/dapr';
import { Changes, IDocHandler } from './docHandler.interface';

export class DocHandler extends AbstractActor implements IDocHandler {
  async applyDiff(changes: Changes): Promise<void> {
    console.log(`Actor ${this.getActorId()} applied changes ${changes}`)
  }
}