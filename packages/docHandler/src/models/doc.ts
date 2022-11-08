import { Model, model, Schema } from 'mongoose';

export interface IDoc {
    docId: string;
    state: Buffer;
}

const DocSchema = new Schema<IDoc>({
    docId: { type: String, required: true },
    state: { type: Buffer, required: true },
});

export const Doc: Model<IDoc> = model<IDoc>('Doc', DocSchema);
