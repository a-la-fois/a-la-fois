import { prop } from '@typegoose/typegoose';
import { ObjectId } from 'mongoose';

export class Consumer {
    _id: ObjectId;

    id: string;

    @prop({ required: true })
    publicKey: string;

    @prop({ required: true })
    name: number;
}
