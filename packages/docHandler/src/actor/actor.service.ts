import { Injectable } from '@nestjs/common';
import { DocHandlerActor } from './docHandler.interface';
import { AbstractActor } from 'dapr-client';

@Injectable()
export class ActorService extends AbstractActor implements DocHandlerActor {
  applyDiff() {
  }

  sync() {
  }

}