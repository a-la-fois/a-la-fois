import { Schema } from 'mongoose';

const Doc = new Schema({
    state: Buffer,
    createdAt: Date,
    updatedAy: Date,
});
