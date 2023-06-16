# tld

tld (Top level domain)

Экспортирует:

```ts
export {
    TldModule, // Модуль
    TldService, // Сервис
};
```

## TldModule

Экспортирует сервис `TldService`

## TldService

Парсит tld из текущего запроса

```ts
import { TldService } from '@a-la-fois/nest-common';

export class SomeService {
    constructor(tldService: TldService) {
        const tld = tldService.getTld();
    }
}
```

### Примеры

| Host             | tld       |
| ---------------- | --------- |
| yandex.ru        | ru        |
| yandex.net       | net       |
| yandex.com.tr    | com.tr    |
| yandex.google.ru | ru        |
| localhost        | localhost |
| 127.0.0.1        | null      |
