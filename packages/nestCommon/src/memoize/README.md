# Memoize

Memoize method via lodash.memoize

Exports:

```ts
export {
  Memoize, // Декоратор
};
```

## Memoize

Memoized decorator for methods

```ts
import { Memoize } from "@a-la-fois/nest-common";

export class SomeService {
  @Memoize()
  method() {}
}
```
