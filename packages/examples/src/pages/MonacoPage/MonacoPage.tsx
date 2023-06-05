import { Client, ServicePayload } from '@a-la-fois/doc-client';
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
                token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbklkIjoiNjIiLCJvbGRUb2tlbklkIjoiNjEiLCJjb25zdW1lcklkIjoiNjQzM2VkNmM2ODdiOGZkYWY5N2M0MzgyIiwiZXhwaXJlZEF0IjoiMjAyMy0wNi0wNVQwMTo0ODoyNS4wODhaIiwidXNlcklkIjoic29tZVVzZXIxIiwiZG9jcyI6W3siaWQiOiI2NDYzMDVjNTMyNTY2ZTkwODlhOWE3MTMiLCJyaWdodHMiOlsicmVhZCIsIndyaXRlIl19XSwiaWF0IjoxNjg1OTI2MTA1fQ.ZxfXiOMIHqzdo3vRPQVxoI_FVtgGK0nw3iHpIgf5yjivZ_HH50eIzb3XliS5quagagh-Q3Qvw4F-BM3-lxIJYRZ9bfcM25taRKBsjRFVLWNn1vCPfu96cVavHgzB4ASofQ1-DTMmYQji_0LGLFBY7pgnezAmN5kTJ7BvwcB67n5_8ye7fE8rpBL-r248gNMOzvqmbGbTWvnZJwfC-O8MQwEniixpFGxByJ3CaM7xYJ9D50bAlHt6oZAzAI0616FRcahBKd7TqnV1SdH9Ju23I6Blt2tPEVfPFFp1yDEJYcLKhfMlDcosjs1nJOKV14rbhDh98N30VjsP8LYGLJc90Q0WDLgVa1ruTLbwzw-dhDxBP5_DUQhs4xFU1ddVvMBTkGKp1wHh3KcvdJMJWIJOtxdptv_VjnZRJerDdQxARvAZggWCN8brDjqkPqrE0Z8Qb3yQK8e6x5zjPq_yaGp5B_VQgbNmgs9bvrOWEiZKQ5g_vFkq7I9xjlsK07pV5eFpWCWL4pCFeIYbi2WdJVDw9WEeRdeTLBrBKJcpoTI-udU7TlguYsFvg223aFjjj2b6DtngxQP89bo-AXb7pyx_EGq5zD-2oeJX-QymWmPn0xl9tkewctVlMeN10pQgPPoFfiErK-CK1gV7tnBc4BT8ZIV0MHbjLIofK7tw_RjkOwc',
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
