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
                token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgiLCJvbGRUb2tlbklkIjoiNyIsImNvbnN1bWVySWQiOiI2NDMzZWQ2YzY4N2I4ZmRhZjk3YzQzODIiLCJ1c2VySWQiOiJzb21lVXNlcjEiLCJkb2NzIjpbeyJpZCI6IjY0NjMwNWM1MzI1NjZlOTA4OWE5YTcxMyIsInJpZ2h0cyI6WyJyZWFkIiwid3JpdGUiXX1dLCJpYXQiOjE2ODQ3MjUxNTh9.khrcrgqZBqemrHkH3Cr7jQobj750DusE2BCf8A6AMkXBviui_nLpmt_Lom1kNzvv27UUe6YMdJwT6he3Y-EKrUgZTb_f1FLF__0NBLj_hL2ho4Nql6qF_PF_Zxr0AJ2diFjwqOjaVLPnEigTvd_-RMOcKY5xaWyEYqOQIwbxL521JyiNC0XdzG_QRHFAwiiDCZw0S0igOgljOHdjpESLH9bliUxU9yGvyC3f9qnjxEOBOtS6e85T2wqg2cZpGhhfqQ96iQhDlNxz2l2FKGYZJ5ULpdeuPjOUMEKbgsii-BbJaQUznsVrNASUC2GllhwbloLCsl3dXJnjvIiJzbt7fEQ0adtQw5_utbyNhTyNrhyjuDENgMLF3kT7G-o3_v8hjrEMmMjPeGEk8QpS3KdfFsIbzQwMutPxOL9lrpDY608yLEJ-sQurPh0Gwe61zWrtSl2axWh1dt2B2C3sdQ7j2PiZ2nT2Fje8qIcxF0fxhhQ20d9Pf6MoQ7_o5fP0AeZOm7Vh4jhMHvTqZDSOpOvLYazkxoXSyDQjQan-Q1ngtkGCYWCEXUCjjBWu42KAR4n6ABjfP_qbgK2Fx40UxIKAyVbMuKKiO3HxFg3JWOCeb6ddrBNDH0G2rAo9Jw3YNyDguiBDAWODNWyAG42Z0Zm_KmFSnJVxhvOd_HwsNdx3_4U',
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
