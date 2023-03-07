import { getModelForClass } from '@typegoose/typegoose';
import { Doc, Update } from '@a-la-fois/models';

export const DocModel = getModelForClass(Doc);
export const UpdateModel = getModelForClass(Update);
