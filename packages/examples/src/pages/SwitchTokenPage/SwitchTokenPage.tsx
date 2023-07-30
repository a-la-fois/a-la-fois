import { Client, DocContainer } from '@a-la-fois/doc-client';
import { useEffect, useState } from 'react';
import { apiUrl, serverUrl, switch1DocId, switch2DocId } from '~/config';
import { ConnectionOverlay } from '~/shared/components/ConnectionOverlay';
import styles from './SwitchTokenPage.module.css';
import { Panel } from './Panel';

// sign and set tokens here (you can sign them with command utils/signToken.js dockId consumerId)
const tokens: Record<string, string> = {
    [switch1DocId]: '',
    [switch2DocId]: '',
};

export const SwitchTokenPage = () => {
    const [client, setClient] = useState<Client | null>(null);
    // const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [activeDoc, setActiveDoc] = useState<DocContainer | null>(null);

    useEffect(() => {
        const init = async () => {
            const client = new Client({
                url: serverUrl,
                apiUrl,
            });

            try {
                await client.connect();
            } catch (err) {
                console.log('err', err);
            }

            setClient(client);
        };

        init();
    }, []);

    const handleActivate = (docId: string) => {
        if (!client) {
            return;
        }

        const token = tokens[docId];

        if (!token) {
            throw new Error(`No token for docId ${docId}`);
        }

        const switchToken = async () => {
            client.disposeDocs();
            await client.setToken(token);

            const doc = await client.getDoc(docId);
            setActiveDoc(doc);
        };

        switchToken();
    };

    return (
        <>
            {!client && <ConnectionOverlay />}
            <div className={styles.SwitchTokenPage}>
                <Panel
                    doc={activeDoc?.id === switch1DocId ? activeDoc : null}
                    onActivate={() => handleActivate(switch1DocId)}
                />
                <Panel
                    doc={activeDoc?.id === switch2DocId ? activeDoc : null}
                    onActivate={() => handleActivate(switch2DocId)}
                />
            </div>
        </>
    );
};
