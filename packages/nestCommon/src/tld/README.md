# tld

tld (Top level domain)

Exports:

```ts
export {
  TldModule, // Module
  TldService, // Service
};
```

## TldModule

Exports serves `TldService`

## TldService

Parses Top Level Domain of the current request

```ts
import { TldService } from "@a-la-fois/nest-common";

export class SomeService {
  constructor(tldService: TldService) {
    const tld = tldService.getTld();
  }
}
```

### Примеры

| Host             | tld       |
| ---------------- | --------- |
| domain.com       | com       |
| domain.ru        | ru        |
| domain.net       | net       |
| domain.com.tr    | com.tr    |
| domain.google.ru | ru        |
| localhost        | localhost |
| 127.0.0.1        | null      |
