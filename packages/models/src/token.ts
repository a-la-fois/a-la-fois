import { ModelOptions, prop } from '@typegoose/typegoose';

@ModelOptions({
    schemaOptions: {
        timestamps: true,
    },
})
export class Token {
    @prop({ required: true, index: true })
    tokenId: string;

    @prop({ required: true, index: true })
    consumerId: string;

    @prop({ required: true })
    userId: string;

    @prop({ required: false, default: false })
    taint: boolean;

    @prop({ required: false })
    expiredAt: Date;
}
