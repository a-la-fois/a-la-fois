import { Client } from '@a-la-fois/doc-client';
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
                token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb25zdW1lcklkIjoiNjQzM2VkNmM2ODdiOGZkYWY5N2M0MzgyIiwidXNlcklkIjoic29tZVVzZXIxIiwiZG9jcyI6W3siaWQiOiI2NDYzMDVjNTMyNTY2ZTkwODlhOWE3MTMiLCJyaWdodHMiOlsicmVhZCIsIndyaXRlIl19XSwiaWF0IjoxNjg0MjEyNDgyfQ.kINKDpa1eOe1bPkeZRdb9wEUPPeRc3UghAJQ7_hv3ekAQADvm2jT-4Gx34071ZGnfrTDkDWohnHGmfj5UDq8JBqwwhXWMFJp3fANRnckU__VpiYyOx5oB_ufo0ABKXBm_EPBefFxGG4XtxYaf3_1lFiKcWYAikYER8YWNWBNM1WYM3yefaQfDqimKC9qSs5FC_JIYc5GO5oM4ZJK9YsfrkFRUqgdQMauX8BD17u6_A8R9ZO-tjF4ZYbO-2pUkYZn4caVdgJn7KiDg2ZeFszF4bwFcb601-l_dcu46Fty2hGk2XU6_USf8ablVOE_odLbWiJ5It5MB-3kn3WZCIoXqoEYQHXo6q0quh9qiKLzgLb2vXVf0_SRpGT29kFRYfXUQdbUaEzxvnwFhjbFTaeH7MXjIxNqy0caX4RW60Vhes9JhUTTpnyNc4KpA6mlo9EPjIvRyNxWRGTbtAiZgbKCagItAE4c0PYdhJmzAr4mOk4qiv9r0EgKDZUt5welB7Y74DyjS9G7CV7L5Hm060bB29mR3aZe_2lOkvfXRWonEvv6J9iF_gPUh8zJXClKwqeU-g7AomkEGyFU04aTfS7C6bD_K-b1vSLA27uIegydXYgwgOfnBBSynszJ0qIPEs6l6CRtn9m6ibcUDxjZaG3qmy4ktVkv5_721RTXJxcCm50',
            });
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

    const handleMount: NonNullable<EditorProps['onMount']> = useCallback((editor) => {
        setEditor(editor);
    }, []);

    useEffect(() => {
        if (client && editor) {
            const init = async () => {
                // const docContainer = await client.getDoc(codeEditorDocId);
                const docContainer = await client.getDoc('646305c532566e9089a9a713');
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
