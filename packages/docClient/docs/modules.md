[@a-la-fois/doc-client](README.md) / Exports

# @a-la-fois/doc-client

## Table of contents

### Classes

- [Client](classes/Client.md)
- [DocContainer](classes/DocContainer.md)

### Type Aliases

- [ClientConfig](modules.md#clientconfig)
- [DocContainerConfig](modules.md#doccontainerconfig)
- [ServiceEvent](modules.md#serviceevent)
- [ServicePayload](modules.md#servicepayload)

## Type Aliases

### ClientConfig

Ƭ **ClientConfig**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `apiUrl` | `string` |
| `token?` | `string` |
| `url` | `string` |

___

### DocContainerConfig

Ƭ **DocContainerConfig**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `api` | `Api` |
| `id` | `string` |
| `messenger` | `Messenger` |

___

### ServiceEvent

Ƭ **ServiceEvent**: `PossibleServiceEvent`[``"data"``][``"event"``]

___

### ServicePayload

Ƭ **ServicePayload**<`EventName`\>: `Extract`<`PossibleServiceEvent`[``"data"``], { `event`: `EventName`  }\>[``"data"``]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `EventName` | extends [`ServiceEvent`](modules.md#serviceevent) |
