import { IsString, IsDefined } from 'class-validator';

export class CreateConsumerDto {
    @IsString()
    @IsDefined()
    name: string;

    @IsString()
    @IsDefined()
    publicKey: string;
}

export class UpdateConsumerDto {
    @IsString()
    publicKey?: string;

    @IsString()
    name?: string;
}

export class RegenerateKeysDto {
    @IsString()
    @IsDefined()
    consumerId: string;
}
