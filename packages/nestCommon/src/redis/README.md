# Redis

[ioredis](https://www.npmjs.com/package/ioredis) addapter

Exports:

```ts
export {
  RedisModule, // Module
  RedisClient, // Decorator
};
```

## RedisModule

Provides [ioredis](https://www.npmjs.com/package/ioredis) Client instance

## RedisClient

Injects Client

```ts
// some.module.ts

import { Module } from "@nestjs/common";
import { RedisModule } from "@a-la-fois/nest-common";

import { Some } from "./some.service";

@Module({
  imports: [
    RedisModule.register(/* ioredis redis config */),

    // Also able to to injected via RedisModule.forRoot(RedisOptions)
  ],
  providers: [SomeService],
  exports: [SomeService],
})
export class SomeModule {}
```

```ts
// some.service.ts
import { RedisClient, Redis } from "@a-la-fois/nest-common";

export class SomeService {
  constructor(@RedisClient() private redis: Redis) {}

  async uploadTextFile(text: string) {
    await this.redis.set("key", "value");
    const val = await this.redis.get("key");
  }
}
```
