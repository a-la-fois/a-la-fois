import { prop } from '@typegoose/typegoose';

export class Consumer {
    @prop({ required: true })
    publicKey: string;

    @prop({ required: true })
    name: number;
}
