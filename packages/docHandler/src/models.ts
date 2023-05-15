import { getModelForClass } from '@typegoose/typegoose';
import { Doc, Update } from '@a-la-fois/models';

const options = {
    schemaOptions: {
        timestamps: true,
    },
};

export const DocModel = getModelForClass(Doc, options);
export const UpdateModel = getModelForClass(Update, options);
