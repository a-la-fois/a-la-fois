import { Client, ServiceEvent, ServicePayload } from '@a-la-fois/doc-client';
import Editor, { EditorProps } from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';
import { useCallback, useEffect, useState } from 'react';
import { MonacoBinding } from 'y-monaco';
import { ConnectionOverlay } from '~/shared/components/ConnectionOverlay';
import { codeEditorDocId, serverUrl, apiUrl } from '~/config';
import monacoStyles from './Monaco.module.css';

export const MonacoPage = () => {
    const [client, setClient] = useState<Client | null>(null);
    const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const init = async () => {
            console.log('init', serverUrl);
            const client = new Client({
                url: serverUrl,
                apiUrl,
            });
            console.log('client created');

            const onUpdateToken = (payload: ServicePayload<'updateToken'>) => {
                console.log(payload);
            };
            client.on<'updateToken'>('updateToken', onUpdateToken);

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

    const handleMount: NonNullable<EditorProps['onMount']> = useCallback((editor) => {
        setEditor(editor);
    }, []);

    useEffect(() => {
        if (client && editor) {
            const init = async () => {
                const docContainer = await client.getDoc(codeEditorDocId);
                setConnected(true);
                const code = docContainer.doc.getText('code');

                new MonacoBinding(code, editor.getModel()!, new Set([editor]), docContainer.awareness);
            };

            init();
            return () => {
                client.dispose();
            };
        }
    }, [client, editor]);

    return (
        <div>
            {!connected && <ConnectionOverlay />}
            <Editor className={monacoStyles.Monaco} height="90vh" defaultLanguage="javascript" onMount={handleMount} />
        </div>
    );
};
