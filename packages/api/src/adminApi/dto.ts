import { IsString, IsDefined } from 'class-validator';

export class CreateConsumerDto {
    @IsString()
    @IsDefined()
    name: string;
}

export class RegenerateKeysDto {
    @IsString()
    @IsDefined()
    consumerId: string;
}
