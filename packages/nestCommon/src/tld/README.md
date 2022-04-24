# tld

tld (Top level domain)
Nest аналог `@yandex-int/express-tld`  
Не является оберткой, просто скопирован код

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
import { TldService } from '@yandex-int/nest-common';

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
