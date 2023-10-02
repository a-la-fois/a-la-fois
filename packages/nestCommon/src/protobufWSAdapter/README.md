## Protobuf ws protocol

### Message format

```
[ eventName ][protobuf message]
[1 byte int ][   rest bytes   ]
```

We can't use grpc as is because grpc routs messages via `path` of http requests. We have ws connection and we don't have `path`, so we will use one byte integer in messages to do messages routing. So we can create 256 different messages. That should be enough

## Scheme

```
1. [Client] encode 'js data' -> 'protobuf Uint8Array'
2. [Client] pack 'protobuf Uint8Array' and '1 byte int as type' -> 'Uint8Array'
3. [Client] send 'Uint8Array' to [Server] via websocket
4. [Server] receive data as 'Buffer'
5. [Server] convert 'Buffer' -> 'ArrayBuffer'
6. [Server] 'ArrayBuffer' -> '1 byte int as type' and 'protobuf Uint8Array'
7. [Server] decode 'protobuf Uint8Array' -> 'js data'
8. [Server] do some server scenario
9. [Server] encode response 'js data' -> 'protobuf Uint8Array'
10. [Server] pack 'protobuf Uint8Array' and '1 byte int as type' -> 'Uint8Array'
11. [Server] send to [Client] via websocket
12. [Client] receive data as 'ArrayBuffer'
13. [Client] 'ArrayBuffer' -> '1 byte int as type' and 'protobuf Uint8Array'
14. [Client] decode 'protobuf Uint8Array' -> 'js data'
15. [Client] be happy
```
