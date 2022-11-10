import { Transform } from 'class-transformer';
import { IsArray, IsString, ArrayMaxSize, IsDefined } from 'class-validator';
import { IDoc } from '@a-la-fois/doc-handler';

export class DocPublicDto {
    id: IDoc['docId'];
    state: IDoc['state'];
}

export class DocsByIdsQueryDto {
    @IsDefined()
    @IsArray()
    @ArrayMaxSize(50)
    @IsString({ each: true })
    @Transform(({ value }) => {
        if (Array.isArray(value)) {
            return value;
        }
        if (typeof value === 'string') {
            return value.split(',');
        }
        return value;
    })
    ids: string[];
}

export class DocsByIdsDto {
    data: DocPublicDto[];
}

export class CreateDocDto {
    id: IDoc['docId'];
}
