import { Client } from '@a-la-fois/doc-client';
import Editor, { EditorProps } from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';
import { useCallback, useEffect, useState } from 'react';
import { MonacoBinding } from 'y-monaco';
import { ConnectionOverlay } from '~/shared/components/ConnectionOverlay';

export const MonacoPage = () => {
    const [client, setClient] = useState<Client | null>(null);
    const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const init = async () => {
            const client = new Client({ url: 'ws://130.193.53.53:3000' });
            await client.connect();

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
                // TODO: set docId
                const docContainer = await client.getDoc('1');
                setConnected(true);
                const code = docContainer.doc.getText('code');

                new MonacoBinding(code, editor.getModel()!, new Set([editor]));
            };

            init();
        }
    }, [client, editor]);

    return (
        <div>
            {!connected && <ConnectionOverlay />}
            <Editor height="90vh" defaultLanguage="javascript" onMount={handleMount} />
        </div>
    );
};
