# AsyncStorage

[AsyncLocalStorage](https://nodejs.org/api/async_context.html#async_context_class_asynclocalstorage) wrapper
Helps in avoiding `@Injectable({ scope: Scope.REQUEST })`.

EXports:

```ts
export {
  AsyncStorageModule, // Module
  AsyncStorageService, // Service
  Context, // Service with access to request data live req, res, headers...
  StorageMemoize, // Decorator for async storage memoization methods
  REQ_KEY,
  RES_KEY,
};
```

## AsyncStorageModule

Exports services `AsyncStorageService`, `Context`
Must be included in the root module of the app

```ts
@Module({
  imports: [AsyncStorageModule.forRoot()],
})
export class AppModule {}
```

## AsyncStorageService

Has methods to store and retrieve data from async storage

```ts
import { AsyncStorageService } from "@a-la-fois/nest-common";

const KEY = Symbol("MY_KEY");

export class SomeService {
  constructor(private storageService: AsyncStorageService) {}

  requestContextMethod() {
    storageService.setData(KEY, { foo: "bar" });
  }

  anotherRequestContextMethod() {
    return storageService.getData(KEY);
  }
}
```

## Context

Stores req, res and headers of the request

```ts
import { Context } from "@a-la-fois/nest-common";

export class SomeService {
  constructor(private context: Context) {}

  requestContextMethod() {
    this.context.req; // express req
  }
}
```

## StorageMemoize

```ts
@Injectable()
class AuthService {
  constructor(private userService: UserService) {}

  @StorageMemoize()
  async getUser() {
    console.log('getUser is executed!');
    const user = await this.userService.getUser();

    return {
      id: uid(),
      name: user.name,
    };
  }
}

...

const user = await this.authService.getUser();
const userAgain = await this.authService.getUser();

user === userAgain; // true
```

getUser will be executed only once
