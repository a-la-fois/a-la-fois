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
                token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbklkIjoiMTkiLCJvbGRUb2tlbklkIjoiMTgiLCJjb25zdW1lcklkIjoiNjQzM2VkNmM2ODdiOGZkYWY5N2M0MzgyIiwidXNlcklkIjoic29tZVVzZXIxIiwiZG9jcyI6W3siaWQiOiI2NDYzMDVjNTMyNTY2ZTkwODlhOWE3MTMiLCJyaWdodHMiOlsicmVhZCIsIndyaXRlIl19XSwiaWF0IjoxNjg0ODA1NzY2fQ.UFFVYDOV6OUoHzaoh1jePzccb1fx2znSzylDAvOYdc46KVG1OiNbqNsxOl8UBYhdjzSulTt4tNe3EpcgcBMAKA4vfuFtDP1UwXRe7dBH4Prkf0knVRUq4oxSwLFgREfF87jmu--7dV6NvubPVaDp0jgqm1jVDLXw9pvuEEng1_LNbRIIyLuvIXsqsB8eg7boQVQUbNVHxgviuZejvObmEA7CqDGWIRArlvQM0G764_7iZF_S2nm_4jsNAhzIyzcTq_uKwi1FVrRLaPSn9xTRxld6FjWJt-UAD7nc6bP7wQWL2R4zjXxc0kcOIdQGp9IV7CXhoJBMeaf3L-kB65E3tdKGGBhtPJaN8YzSFA1yGl4J_sqxw8x1567B9MWAx5tiwsEafoZLTN2bPClTKHK3FO8IiUMTcA3PKvGIPYitybHFAY-sbGbjMvsv6tyHZRJvzOfSBtuisaVHlcXCzpy-zMPXIVB51LAqp33JO0eGFb-3ZZVwiFJovDUtMyJIbVXTtxt7h6UzYwVpRPN4q0sRfXZWVo-YahrIDqALQubxcRkx2XacCaj1i--vPU43R6z_Oqqq9Lm3HNQprh21-BEuzlVkCX4Bwk5WG87Vl33dmlIY9Nm64CFyeC6KrpHpfVaCxrFTs84iFAR32aPdtPJyOwAnPCfU56G63alHF1vEIyo',
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
