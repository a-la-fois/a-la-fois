import { getModelForClass } from '@typegoose/typegoose';
import { Doc } from '@a-la-fois/models';

export const DocModel = getModelForClass(Doc);
