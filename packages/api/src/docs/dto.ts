import { Transform } from 'class-transformer';
import { IsArray, IsString, ArrayMaxSize, IsDefined } from 'class-validator';
import { Doc } from '@a-la-fois/models';

export class DocPublicDto {
    id: string;
    state: Doc['state'];
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

export class CreateDocDto {}
