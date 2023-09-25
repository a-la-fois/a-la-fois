# s3

S3 addapter

Exports:

```ts
export {
  S3Module, // Module
  S3Client, // Decorator
};
```

## S3Module

Provides S3 Client of [aws-sdk](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html)

## S3Client

Injects S3 Client

```ts
// some.module.ts

import { Module } from "@nestjs/common";
import { S3Module } from "@a-la-fois/nest-common";

import { Some } from "./some.service";

@Module({
  imports: [
    S3Module.register(/* aws-sdk S3 Client config */),

    // Also S3Module is able to to be used via S3Module.forRoot(S3Options)
  ],
  providers: [SomeService],
  exports: [SomeService],
})
export class SomeModule {}
```

```ts
// some.service.ts
import { S3Client, S3 } from "@a-la-fois/nest-common";

export class SomeService {
  constructor(@S3Client() private s3Client: S3) {}

  async uploadTextFile(text: string) {
    return this.s3Client
      .putObject({
        Bucket: "my-bucket",
        Key: "files/file.txt",
        Body: text,
      })
      .promise();
  }
}
```
