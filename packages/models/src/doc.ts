import { prop, Ref } from '@typegoose/typegoose';
import { Consumer } from './consumer';

export class Doc {
    id: string;

    @prop({ default: Buffer.from('AAA=', 'base64') })
    state: Buffer;

    @prop({ ref: () => Consumer, index: true, default: null })
    owner: Ref<Consumer> | null;

    @prop({ default: false })
    public: boolean = false;
}
