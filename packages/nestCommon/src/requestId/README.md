# requestId

Generates requestId

Exports:

```ts
export {
  RequestIdModule, // Module
  RequestIdService, // Service
  RequestIdOptions, // Config Typings
};
```

## RequestIdModule

Exports `RequestIdService`

Is able to included in 3 ways:

```ts
import { Module } from "@nestjs/common";
import { RequestIdModule, AsyncStorageModule } from "@a-la-fois/nest-common";

// Once per application
@Module({
  imports: [
    RequestIdModule.forRoot(/* RequestIdOptions */),
    AsyncStorageModule.forRoot(),
  ],
})
export class AppModule {}

// To some module
@Module({
  imports: [RequestIdModule.register(/* RequestIdOptions */)],
})
export class SomeModule {}

// To some module with default config
@Module({
  imports: [RequestIdModule],
})
export class SomeModule {}
```

This module requires `AsyncStorageModule.forRoot()`

## RequestIdService

Returns requestId

```ts
import { RequestIdService } from '@a-la-fois/nest-common';

export class SomeService {
  constructor(private requestIdService: RequestIdService) {}

  async method () => {
    const requestId = await this.requestIdService.getRequestId();
  }
}
```

## RequestIdOptions

```ts
type RequestIdOptions = {
  /**
   * Header where module will be looking for requestId if it exists
   *
   * @default: x-request-id
   */
  headerName?: string;

  /**
   * Function of uid generation
   *
   * By default it is [nanoid](https://www.npmjs.com/package/nanoid)
   */
  uid?: () => string;
};
```
