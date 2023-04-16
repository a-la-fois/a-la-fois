import { Response } from './common';

export type DocIsPublicRequest = {
    docId: string;
};

export type DocIsPublicResponse = Response<{
    isPublic: boolean;
}>;
