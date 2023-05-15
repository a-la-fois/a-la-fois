import { getModelForClass } from '@typegoose/typegoose';
import { Consumer, Doc, Token, Update } from '@a-la-fois/models';

const options = {
    schemaOptions: {
        timestamps: true,
    },
};

export const DocModel = getModelForClass(Doc, options);
export const UpdateModel = getModelForClass(Update, options);
export const ConsumerModel = getModelForClass(Consumer, options);
export const TokenModel = getModelForClass(Token, options);
