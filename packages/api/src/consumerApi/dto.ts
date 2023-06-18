import { Doc } from '@a-la-fois/models';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsDefined, IsString } from 'class-validator';

export class DocPublicDto {
    id: string;
    state: Doc['state'];
    public: boolean;
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

export class CreateDocBodyDto {
    @IsBoolean()
    public: boolean = false;
}

export class CreateDocDto {}
