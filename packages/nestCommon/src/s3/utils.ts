import AWS from 'aws-sdk';

import { S3Options } from './types';

export const createClient = (options: S3Options) => {
    return new AWS.S3(options);
};
