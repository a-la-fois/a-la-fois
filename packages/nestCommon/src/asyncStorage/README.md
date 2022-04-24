# AsyncStorage

Обертка [AsyncLocalStorage](https://nodejs.org/api/async_context.html#async_context_class_asynclocalstorage)  
Необходима, чтобы избежать `@Injectable({ scope: Scope.REQUEST })`. С этим модулем можно все сервисы делать синглтонами

Экспортирует:

```ts
export {
    AsyncStorageModule, // Модуль
    AsyncStorageService, // Сервис
    Context, // Контекст запроса с req, res, headers, ...
    StorageMemoize, // Декоратор для методов. Умеет сладывать результат в AsyncStorage и вытаскивать его при повторном вызове
    REQ_KEY,
    RES_KEY,
};
```

## AsyncStorageModule

Экспортирует сервис `AsyncStorageService`, `Context`
Подключить в корневом модуле

```ts
@Module({
    imports: [AsyncStorageModule.forRoot()],
})
export class AppModule {}
```

## AsyncStorageService

Умеет хранить и отдавать данные со скоупом размером в запрос

```ts
import { AsyncStorageService } from '@yandex-int/nest-common';

const KEY = Symbol('MY_KEY');

export class SomeService {
    constructor(private storageService: AsyncStorageService) {}

    requestContextMethod() {
        storageService.setData(KEY, { foo: 'bar' });
    }

    anotherRequestContextMethod() {
        return storageService.getData(KEY);
    }
}
```

## Context

Умеет хранить и отдавать данные со скоупом размером в запрос

```ts
import { Context } from '@yandex-int/nest-common';

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
    constructor(private blackboxService: BlackboxService) {}

    @StorageMemoize()
    async getUser() {
        const bb = await this.blackboxService.getBlackbox();

        return {
            id: uid(),
            name: bb.displayName,
        };
    }
}
```

Если дважды в рамках одного запроса вызвать метод он исполнится единожды

```ts
const user = await this.authService.getUser();
const userAgain = await this.authService.getUser();

user === userAgain; // true
```
