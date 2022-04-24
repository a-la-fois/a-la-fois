# Redis

Модуль для работы с Redis

Экспортирует:

```ts
export {
    RedisModule, // Модуль
    RedisClient, // Декоратор
};
```

## RedisModule

Провайдит redis клиент из библиотеки [ioredis](https://www.npmjs.com/package/ioredis)

## RedisClient

Инектит Redis клиент

```ts
// some.module.ts

import { Module } from '@nestjs/common';
import { RedisModule } from '@yandex-int/nest-common';
import config from '@yandex-int/yandex-cfg';

import { Some } from './some.service';

@Module({
    imports: [
        RedisModule.register(/* конфиг redis клиента ioredis */),

        // Так же RedisModule может подключаться глобально через RedisModule.forRoot(RedisOptions)
    ],
    providers: [SomeService],
    exports: [SomeService],
})
export class SomeModule {}
```

```ts
// some.service.ts
import { RedisClient, Redis } from '@yandex-int/nest-common';

export class SomeService {
    constructor(@RedisClient() private redis: Redis) {}

    async uploadTextFile(text: string) {
        await this.redis.set('key', 'value');
        const val = await this.redis.get('key');
    }
}
```
