# Cookie

Module for cookies parsing

Exports:

```ts
export {
  CookieModule, // Module
  CookieService, // Service
  Cookies, // Cookies typings
};
```

## CookieModule

Exports service `CookieService`

## CookieService

Returns parsed cookies

```ts
import { CookieService } from "@a-la-fois/nest-common";

export class SomeService {
  constructor(cookieService: CookieService) {
    const cookies = cookieService.getCookies();
  }
}
```
