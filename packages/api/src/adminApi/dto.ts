import { IsString, IsDefined, IsOptional } from 'class-validator';

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
    @IsOptional()
    publicKey?: string;

    @IsString()
    @IsOptional()
    name?: string;
}

export class RegenerateKeysDto {
    @IsString()
    @IsDefined()
    consumerId: string;
}
