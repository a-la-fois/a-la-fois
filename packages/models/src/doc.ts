import { prop, Ref } from '@typegoose/typegoose';
import { Consumer } from './consumer';

export class Doc {
    @prop({ required: true, unique: true })
    docId: string;

    @prop({ required: true })
    state: Buffer;

    @prop({ required: true, ref: () => Consumer, index: true })
    owner: Ref<Consumer>;
}
