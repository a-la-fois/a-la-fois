import * as Y from 'yjs';
import { Client } from '@a-la-fois/doc-client';
import { createContext, useEffect, useState } from 'react';
import { canvasDocId, serverUrl } from '~/config';
import { CanvasEvent, ChangeColorEvent, ChangeColorEventName } from '.';

interface CanvasContextProviderProps {
    children: any;
}

type CanvasContextValue = [
    connected: boolean,
    canvasState: Map<string, string> | null,
    handle: (event: CanvasEvent) => void
];

export const CanvasContext = createContext<CanvasContextValue | null>(null);

export const CanvasContextProvider = ({ children }: CanvasContextProviderProps) => {
    const [yMap, setYMap] = useState<Y.Map<string> | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [canvasState, setCanvasState] = useState<Map<string, string> | null>(null);
    const [connected, setConnected] = useState<boolean>(false);

    useEffect(() => {
        const init = async () => {
            console.log('init', serverUrl);
            const client = new Client({ url: serverUrl });
            console.log('client created');
            try {
                await client.connect();
            } catch (err) {
                console.log('err', err);
            }

            console.log('after connect');

            setClient(client);
        };

        init();
    }, []);

    useEffect(() => {
        if (client) {
            const init = async () => {
                const docContainer = await client.getDoc(canvasDocId);
                const ymap = docContainer.doc.getMap<string>('canvas');
                setConnected(true);
                setYMap(ymap);

                ymap.observe((event) => {
                    const json = event.target.toJSON();
                    setCanvasState(new Map(Object.entries(json)));
                });
            };

            init();
        }
    }, [client]);

    const handle = (event: CanvasEvent) => {
        switch (event.name) {
            case ChangeColorEventName: {
                if (yMap) {
                    const { name, payload } = event as ChangeColorEvent;
                    const key = payload.position.join('_');
                    yMap.set(key, payload.color);
                    break;
                }
            }
        }
    };

    return <CanvasContext.Provider value={[connected, canvasState, handle]}>{children}</CanvasContext.Provider>;
};
