import { prop } from '@typegoose/typegoose';

export class Token {
    @prop({ required: true, index: true })
    hash: string;

    @prop({ required: true })
    consumerId: string;

    @prop({ required: true })
    userId: string;

    @prop({ required: true })
    docs: string[];

    @prop({ required: false, default: false })
    taint: boolean;

    @prop({ required: false })
    expiredAt: Date;
}
