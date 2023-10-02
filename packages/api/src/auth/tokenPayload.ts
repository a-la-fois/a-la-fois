import { IsDate, IsDefined, IsString, MaxDate, MinDate, ValidateIf, validate } from 'class-validator';
import { JWTPayload, Right } from 'src/messages';
import { config } from '../config';

export type ValidationResult = {
    ok: boolean;
    message?: string;
};

const TTL = parseInt(config.admin.maxTokenTtlHours);

export class TokenPayload {
    isUpdateToken: boolean;

    @IsString()
    @IsDefined()
    tokenId: string;

    @IsString()
    @IsDefined()
    consumerId: string;

    @IsString()
    @IsDefined()
    userId: string;

    @IsDate()
    @IsDefined()
    @MinDate(() => new Date(), { message: 'expiredAt field must be in future' })
    @MaxDate(
        () => {
            const nowPlusTtl = new Date();
            //                                        sec    min  hour
            nowPlusTtl.setTime(nowPlusTtl.getTime() + 1000 * 60 * 60 * TTL);

            return nowPlusTtl;
        },
        { message: `Token TTL must not be longer then ${TTL} hours` },
    )
    expiredAt?: Date;

    @IsDefined()
    docs?: {
        id: string;
        rights: Right[];
    }[];

    @ValidateIf((o) => o.isUpdateToken)
    @IsString()
    @IsDefined()
    oldTokenId: string;

    constructor(payload: Partial<JWTPayload> & { oldTokenId?: string }, isUpdateToken = false) {
        this.isUpdateToken = isUpdateToken;
        this.tokenId = payload.tokenId;
        this.consumerId = payload.consumerId;
        this.userId = payload.userId;
        this.expiredAt = new Date(payload.expiredAt);
        this.docs = payload.docs;
        this.oldTokenId = payload.oldTokenId;
    }

    async validate(): Promise<ValidationResult[]> {
        const errors = await validate(this);

        if (errors) {
            return errors.map((err) => ({
                ok: false,
                message: err.toString(false, false, '', true),
            }));
        }

        return [];
    }
}
