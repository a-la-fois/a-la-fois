import { ModelOptions, prop } from '@typegoose/typegoose';

@ModelOptions({
    schemaOptions: {
        timestamps: true,
    },
})
export class Consumer {
    id: string;

    @prop({ required: true })
    publicKey: string;

    @prop({ required: true })
    name: string;
}
