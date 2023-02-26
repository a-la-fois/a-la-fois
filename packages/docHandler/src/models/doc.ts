import { Model, model, Schema } from 'mongoose';

export interface IDoc {
    docId: string;
    state: Buffer;
}

export const DocSchema = new Schema<IDoc>({
    docId: { type: String, required: true },
    state: { type: Buffer, required: true },
});

export const DocModel: Model<IDoc> = model<IDoc>('Doc', DocSchema);
