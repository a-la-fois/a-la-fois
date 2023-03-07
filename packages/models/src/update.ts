import { index, modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { timestamps: { createdAt: true, updatedAt: false } } })
@index({ createdAt: 1 })
export class Update {
    @prop({ required: true, index: true })
    docId: string;

    @prop({ required: true })
    state: Buffer;

    @prop({ required: true })
    userId: string;

    createdAt: Date;
}
