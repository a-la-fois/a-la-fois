# requestId

Модуль генерирующий requestId

Экспортирует:

```ts
export {
    RequestIdModule, // Модуль
    RequestIdService, // Сервис
    RequestIdOptions, // Тайпинги конфига
};
```

## RequestIdModule

Экспортирует сервис `RequestIdService`

Подключается 3 способами:

```ts
import { Module } from '@nestjs/common';
import { RequestIdModule, AsyncStorageModule } from '@yandex-int/nest-common';

// Один раз на все приложение
@Module({
    imports: [RequestIdModule.forRoot(/* RequestIdOptions */), AsyncStorageModule.forRoot()],
})
export class AppModule {}

// В какой-то модуль
@Module({
    imports: [RequestIdModule.register(/* RequestIdOptions */)],
})
export class SomeModule {}

// В какой-то модуль c дефолтными настройками
@Module({
    imports: [RequestIdModule],
})
export class SomeModule {}
```

Важно подключить `AsyncStorageModule.forRoot()` в каком либо месте (желательно в рутовом модуле)

## RequestIdService

Возвращается requestId

```ts
import { RequestIdService } from '@yandex-int/nest-common';

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
     * Заголовок из которого будет брать requestId если он есть
     *
     * По-умолчанию: x-request-id
     */
    headerName?: string;

    /**
     * Собственная функция генерации uid
     *
     * По-умолчанию используется nanoid из цифр и букв длинной 8 символов
     */
    uid?: () => string;
};
```
