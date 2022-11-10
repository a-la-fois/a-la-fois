import { IDoc } from '@a-la-fois/doc-handler';

export class IDocPublicDto {
    id: IDoc['docId'];
    state: IDoc['state'];
}

export class DocsByIdsDto {
    data: IDocPublicDto[];
}

export class CreateDocDto {
    id: IDoc['docId'];
}
