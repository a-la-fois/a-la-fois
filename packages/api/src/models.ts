import { getModelForClass } from '@typegoose/typegoose';
import { Consumer, Doc } from '@a-la-fois/models';

export const DocModel = getModelForClass(Doc);
export const ConsumerModel = getModelForClass(Consumer);
