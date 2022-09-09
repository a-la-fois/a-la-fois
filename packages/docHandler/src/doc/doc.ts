import { model, Schema } from 'mongoose';

const DocSchema = new Schema({
    state: Buffer,
    createdAt: Date,
    updatedAy: Date,
});

const Doc = model('Doc', DocSchema);

export default Doc;
