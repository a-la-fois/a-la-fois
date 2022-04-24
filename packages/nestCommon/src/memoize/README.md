# Memoize

Мемоизация

Экспортирует:

```ts
export {
    Memoize, // Декоратор
};
```

## Memoize

Мемоизирующий декоратор для методов

```ts
import { Memoize } from '@yandex-int/nest-common';

export class SomeService {
    @Memoize()
    method() {}
}
```
