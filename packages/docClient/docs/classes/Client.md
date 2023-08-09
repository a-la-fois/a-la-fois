[@a-la-fois/doc-client](../README.md) / [Exports](../modules.md) / Client

# Class: Client

## Hierarchy

- `EventEmitter`<[`ServiceEvent`](../modules.md#serviceevent), `PossibleServiceEvent`[``"data"``]\>

  ↳ **`Client`**

## Table of contents

### Constructors

- [constructor](Client.md#constructor)

### Methods

- [addListener](Client.md#addlistener)
- [connect](Client.md#connect)
- [dispose](Client.md#dispose)
- [disposeDocs](Client.md#disposedocs)
- [emit](Client.md#emit)
- [getDoc](Client.md#getdoc)
- [off](Client.md#off)
- [on](Client.md#on)
- [once](Client.md#once)
- [setToken](Client.md#settoken)

## Constructors

### constructor

• **new Client**(`config`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`ClientConfig`](../modules.md#clientconfig) |

## Methods

### addListener

▸ **addListener**<`T`\>(`event`, `fn`, `context?`): [`Client`](Client.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends ``"updateToken"`` \| ``"expiredToken"`` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `T` |
| `fn` | (...`args`: `any`[]) => `void` |
| `context?` | { `data`: `UpdateTokenPayload` ; `event`: ``"updateToken"``  } \| { `data`: `TokenExpiredPayload` ; `event`: ``"expiredToken"``  } |

#### Returns

[`Client`](Client.md)

___

### connect

▸ **connect**(): `Promise`<`void`\>

Init connection to the server

#### Returns

`Promise`<`void`\>

___

### dispose

▸ **dispose**(): `void`

#### Returns

`void`

___

### disposeDocs

▸ **disposeDocs**(): `void`

#### Returns

`void`

___

### emit

▸ **emit**<`EventName`\>(`event`, `payload`): `boolean`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `EventName` | extends ``"updateToken"`` \| ``"expiredToken"`` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `EventName` |
| `payload` | [`ServicePayload`](../modules.md#servicepayload)<`EventName`\> |

#### Returns

`boolean`

___

### getDoc

▸ **getDoc**(`id`): `Promise`<[`DocContainer`](DocContainer.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<[`DocContainer`](DocContainer.md)\>

___

### off

▸ **off**<`EventName`\>(`event`, `listener`): [`Client`](Client.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `EventName` | extends ``"updateToken"`` \| ``"expiredToken"`` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `EventName` |
| `listener` | (`payload`: [`ServicePayload`](../modules.md#servicepayload)<`EventName`\>) => `void` |

#### Returns

[`Client`](Client.md)

___

### on

▸ **on**<`EventName`\>(`event`, `listener`): [`Client`](Client.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `EventName` | extends ``"updateToken"`` \| ``"expiredToken"`` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `EventName` |
| `listener` | (`payload`: [`ServicePayload`](../modules.md#servicepayload)<`EventName`\>) => `void` |

#### Returns

[`Client`](Client.md)

___

### once

▸ **once**<`EventName`\>(`event`, `listener`): [`Client`](Client.md)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `EventName` | extends ``"updateToken"`` \| ``"expiredToken"`` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `EventName` |
| `listener` | (`payload`: [`ServicePayload`](../modules.md#servicepayload)<`EventName`\>) => `void` |

#### Returns

[`Client`](Client.md)

___

### setToken

▸ **setToken**(`token`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `token` | `string` |

#### Returns

`Promise`<`void`\>
