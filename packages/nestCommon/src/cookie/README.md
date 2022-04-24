# Cookie

Для парсинга cookie

Экспортирует:

```ts
export {
    CookieModule, // Модуль
    CookieService, // Сервис
    Cookies, // Тайпинг cookies
};
```

## CookieModule

Экспортирует сервис `CookieService`

## CookieService

Умеет возвращать распарсенные cookie запроса

```ts
import { CookieService } from '@yandex-int/nest-common';

export class SomeService {
    constructor(cookieService: CookieService) {
        const cookies = cookieService.getCookies();
    }
}
```
