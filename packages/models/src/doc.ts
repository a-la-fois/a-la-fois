import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Consumer } from './consumer';

export class Doc {
    @prop({ required: true })
    docId: string;

    @prop({ required: true })
    state: Buffer;

    @prop({ required: true, ref: () => Consumer })
    owner: Ref<Consumer>;
}

export const DocModel = getModelForClass(Doc);
