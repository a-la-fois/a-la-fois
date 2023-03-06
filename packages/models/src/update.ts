import { prop } from '@typegoose/typegoose';

export class Update {
    @prop({ required: true })
    docId: string;

    @prop({ required: true })
    state: Buffer;

    @prop({ required: true })
    userId: string;
}
