import { prop, getModelForClass } from '@typegoose/typegoose';

export class Consumer {
    @prop({ required: true })
    publicKey: string;

    @prop({ required: true })
    name: number;
}

export const ConsumerModel = getModelForClass(Consumer);
