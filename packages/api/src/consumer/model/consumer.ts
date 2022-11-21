import { model, Model, Schema } from 'mongoose';

export interface Consumer {
    id: string;
    publicKey: string;
    name: string;
}

export const ConsumerSchema = new Schema<Consumer>({
    id: { type: String, required: true },
    publicKey: { type: String, required: true },
    name: { type: String, required: true },
});

export const ConsumerModel: Model<Consumer> = model<Consumer>('Consumer', ConsumerSchema);