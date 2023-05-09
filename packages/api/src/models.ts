import { getModelForClass } from '@typegoose/typegoose';
import { Consumer, Doc, Update } from '@a-la-fois/models';

export const DocModel = getModelForClass(Doc);
export const UpdateModel = getModelForClass(Update);
export const ConsumerModel = getModelForClass(Consumer);
