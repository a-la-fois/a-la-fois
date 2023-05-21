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
                token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb25zdW1lcklkIjoiNjQzM2VkNmM2ODdiOGZkYWY5N2M0MzgyIiwidXNlcklkIjoic29tZVVzZXIxIiwiZG9jcyI6W3siaWQiOiI2NDYzMDVjNTMyNTY2ZTkwODlhOWE3MTMiLCJyaWdodHMiOlsicmVhZCIsIndyaXRlIl19XSwiaWF0IjoxNjg0MjkzOTY3fQ.ZLSwMpwSq-v2-hGBgwvr6NOEwY9Rq-hWU1_nn32DCfCLSCIxxL4Wp3Z7v0OYaoSh_rvBaWkxzrH6x76nGE8Q7NJuOMS6brUGg3utN0srbxTVxxEK0Tu6rdmWGtnfJFnLE1DTC1O4yTN7TNlzIc0-A7UxESHv-isTQ06DuXPbORmC1AvAHwHe9P38vDTuGDt3XbKcp4zzruauyMjg1dphFKT8pvTLbI5cyXh9hEKolRs7-XEn_GZ4HMtIcdylUqvaC_REH94YbcX4XZVVwoCSHL46WKBrmIRaf6K_GP76CMw6QsuwtoyexjGYFyd06ee_YefjNOAqXDjATGNj757KGHgnry03O4O6qcoYqvcPYNhZNLt2CPLAgheOwkZktDi9PZ_dWirsuxM__CVKPl7s0lykEoSOYoPhRmjPkvKVNsWtcd6pDqqEnDbDb9r0CjbOtxixRZpvfF-KiNTgZZ9VmLkTsUd9jmgbur_3UCGgQ5ASY9wwV912b27uAlhQhJXVgvrczoYSXGla9mGKK6z4VS3IiABpPrRrAz9sCVHoWiiEZe1ONStQF86JK0qlULvnb-AyYVrOKe9NYgsIyXz5clRilOWa7rAv2YyG1pamto31nDzryI4kGsMGs5C93jv-pMr2i_EiNdfETwok5VaQcS3Kq9dsfGmrVS_7n_kMens',
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
