# s3

Модуль для работы с s3

Экспортирует:

```ts
export {
    S3Module, // Модуль
    S3Client, // Декоратор
};
```

## S3Module

Провайдит S3 клиент из библиотеки [aws-sdk](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html)

## S3Client

Инектит s3Client

```ts
// some.module.ts

import { Module } from '@nestjs/common';
import { S3Module } from '@yandex-int/nest-common';
import config from '@yandex-int/yandex-cfg';

import { Some } from './some.service';

@Module({
    imports: [
        S3Module.register(/* конфиг s3 клиента aws-sdk */),

        // Так же S3Module может подключаться глобально через S3Module.forRoot(S3Options)
    ],
    providers: [SomeService],
    exports: [SomeService],
})
export class SomeModule {}
```

```ts
// some.service.ts
import { S3Client, S3 } from '@yandex-int/nest-common';

export class SomeService {
    constructor(@S3Client() private s3Client: S3) {}

    async uploadTextFile(text: string) {
        return this.s3Client
            .putObject({
                Bucket: 'my-bucket',
                Key: 'files/file.txt',
                Body: text,
            })
            .promise();
    }
}
```
