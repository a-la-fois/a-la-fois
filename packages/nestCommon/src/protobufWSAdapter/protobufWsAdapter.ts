import { INestApplicationContext, Logger } from '@nestjs/common';
import { loadPackage } from '@nestjs/common/utils/load-package.util';
import { AbstractWsAdapter } from '@nestjs/websockets';
import {
    CLOSE_EVENT,
    CONNECTION_EVENT,
    ERROR_EVENT,
} from '@nestjs/websockets/constants';
import { MessageMappingProperties } from '@nestjs/websockets/gateway-metadata-explorer';
import * as http from 'http';
import { EMPTY, fromEvent, Observable } from 'rxjs';
import { filter, first, mergeMap, share, takeUntil } from 'rxjs/operators';
import { unpackMessage } from './lib/message';
import { bufferToArrayBuffer } from './lib/buffer';

let wsPackage: any = {};

enum READY_STATE {
    CONNECTING_STATE = 0,
    OPEN_STATE = 1,
    CLOSING_STATE = 2,
    CLOSED_STATE = 3,
}

type HttpServerRegistryKey = number;
type HttpServerRegistryEntry = any;
type WsServerRegistryKey = number;
type WsServerRegistryEntry = any[];

const UNDERLYING_HTTP_SERVER_PORT = 0;

export class ProtobufWsAdapter extends AbstractWsAdapter {
    protected readonly logger = new Logger(ProtobufWsAdapter.name);
    protected readonly httpServersRegistry = new Map<
        HttpServerRegistryKey,
        HttpServerRegistryEntry
    >();
    protected readonly wsServersRegistry = new Map<
        WsServerRegistryKey,
        WsServerRegistryEntry
    >();

    constructor(appOrHttpServer?: INestApplicationContext | any) {
        super(appOrHttpServer);
        wsPackage = loadPackage('ws', 'WsAdapter', () => require('ws'));
    }

    public create(
        port: number,
        options?: Record<string, any> & { namespace?: string; server?: any }
    ) {
        const { server, ...wsOptions } = options || {};

        if (wsOptions?.namespace) {
            const error = new Error(
                '"WsAdapter" does not support namespaces. If you need namespaces in your project, consider using the "@nestjs/platform-socket.io" package instead.'
            );
            this.logger.error(error);
            throw error;
        }

        if (port === UNDERLYING_HTTP_SERVER_PORT && this.httpServer) {
            this.ensureHttpServerExists(port, this.httpServer);
            const wsServer = this.bindErrorHandler(
                new wsPackage.Server({
                    noServer: true,
                    ...wsOptions,
                })
            );

            this.addWsServerToRegistry(wsServer, port, options?.path || '/');
            return wsServer;
        }

        if (server) {
            return server;
        }

        if (options?.path && port !== UNDERLYING_HTTP_SERVER_PORT) {
            // Multiple servers with different paths
            // sharing a single HTTP/S server running on different port
            // than a regular HTTP application
            const httpServer = this.ensureHttpServerExists(port);
            httpServer?.listen(port);

            const wsServer = this.bindErrorHandler(
                new wsPackage.Server({
                    noServer: true,
                    ...wsOptions,
                })
            );
            this.addWsServerToRegistry(wsServer, port, options?.path);
            return wsServer;
        }
        const wsServer = this.bindErrorHandler(
            new wsPackage.Server({
                port,
                ...wsOptions,
            })
        );
        return wsServer;
    }

    public bindMessageHandlers(
        client: any,
        handlers: MessageMappingProperties[],
        transform: (data: any) => Observable<any>
    ) {
        const handlersMap = this.mapHandlers(handlers);

        const close$ = fromEvent(client, CLOSE_EVENT).pipe(share(), first());
        const source$ = fromEvent(client, 'message').pipe(
            mergeMap((data) =>
                this.bindMessageHandler(data, handlersMap, transform).pipe(
                    filter((result) => result)
                )
            ),
            takeUntil(close$)
        );
        const onMessage = (response: any) => {
            if (client.readyState !== READY_STATE.OPEN_STATE) {
                return;
            }

            client.send(response);
        };
        source$.subscribe(onMessage);
    }

    public bindMessageHandler(
        buffer: any,
        handlersMap: MessageMappingMap,
        transform: (data: any) => Observable<any>
    ): Observable<any> {
        try {
            const data = bufferToArrayBuffer(buffer.data);
            const unpackedMessage = unpackMessage(data);

            const callback = handlersMap[unpackedMessage.type];

            return transform(callback(unpackedMessage.data));
        } catch (err) {
            console.error(err);
            return EMPTY;
        }
    }

    public bindErrorHandler(server: any) {
        server.on(CONNECTION_EVENT, (ws: any) =>
            ws.on(ERROR_EVENT, (err: any) => this.logger.error(err))
        );
        server.on(ERROR_EVENT, (err: any) => this.logger.error(err));
        return server;
    }

    public bindClientDisconnect(client: any, callback: Function) {
        client.on(CLOSE_EVENT, callback);
    }

    public async dispose() {
        const closeEventSignals = Array.from(this.httpServersRegistry)
            .filter(([port]) => port !== UNDERLYING_HTTP_SERVER_PORT)
            .map(
                ([_, server]) => new Promise((resolve) => server.close(resolve))
            );

        await Promise.all(closeEventSignals);
        this.httpServersRegistry.clear();
        this.wsServersRegistry.clear();
    }

    protected ensureHttpServerExists(
        port: number,
        httpServer = http.createServer()
    ) {
        if (this.httpServersRegistry.has(port)) {
            return;
        }
        this.httpServersRegistry.set(port, httpServer);

        httpServer.on('upgrade', (request, socket, head) => {
            const baseUrl = 'ws://' + request.headers.host + '/';
            const pathname = new URL(request.url ?? '', baseUrl).pathname;
            const wsServersCollection = this.wsServersRegistry.get(port);

            let isRequestDelegated = false;
            for (const wsServer of wsServersCollection ?? []) {
                if (pathname === wsServer.path) {
                    wsServer.handleUpgrade(
                        request,
                        socket,
                        head,
                        (ws: unknown) => {
                            wsServer.emit('connection', ws, request);
                        }
                    );
                    isRequestDelegated = true;
                    break;
                }
            }
            if (!isRequestDelegated) {
                socket.destroy();
            }
        });
        return httpServer;
    }

    protected addWsServerToRegistry<T extends SomeType = any>(
        wsServer: T,
        port: number,
        path: string
    ) {
        const entries = this.wsServersRegistry.get(port) ?? [];
        entries.push(wsServer);

        wsServer.path = path;
        this.wsServersRegistry.set(port, entries);
    }

    protected mapHandlers(handlers: MessageMappingProperties[]) {
        return handlers.reduce((acc, handler) => {
            acc[handler.message] = handler.callback;

            return acc;
        }, {} as MessageMappingMap);
    }

    static parseMessage(message: Buffer) {
        const dataViewer = new DataView(
            ProtobufWsAdapter.bufferToArrayBuffer(message)
        );

        const type = dataViewer.getUint8(0);
        const body = message.slice(1);

        return {
            type,
            body,
        };
    }

    static bufferToArrayBuffer(buffer: Buffer) {
        const ab = new ArrayBuffer(buffer.length);
        const view = new Uint8Array(ab);

        for (let i = 0; i < buffer.length; ++i) {
            view[i] = buffer[i];
        }

        return ab;
    }
}

// TODO
type SomeType = Record<'path', string>;

type MessageMappingMap = Record<number, MessageMappingProperties['callback']>;
