import { prop } from '@typegoose/typegoose';

export class Consumer {
    id: string;

    @prop({ required: true })
    publicKey: string;

    @prop({ required: true })
    name: string;
}
