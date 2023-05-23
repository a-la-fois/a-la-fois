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
                token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbklkIjoiNDMiLCJvbGRUb2tlbklkIjoiNDIiLCJjb25zdW1lcklkIjoiNjQzM2VkNmM2ODdiOGZkYWY5N2M0MzgyIiwiZXhwaXJlZEF0IjoiMjAyMy0wNS0yM1QxMzoxMjoxNy45NzNaIiwidXNlcklkIjoic29tZVVzZXIxIiwiZG9jcyI6W3siaWQiOiI2NDYzMDVjNTMyNTY2ZTkwODlhOWE3MTMiLCJyaWdodHMiOlsicmVhZCIsIndyaXRlIl19XSwiaWF0IjoxNjg0ODQ3NDc3fQ.LZyKjyRkN9NreVhH4Y0v4vAQSSyw7NOiAsvgIXMKjD2nI5xeyi_FOV55AVt4NnKE6lFHnH5qXlLnJYGaghC4TPm2YZByRWPPGi0lzytN0xCn5YVMHsOcIMjTU7shPQiP08vhvhY5gp_U3PdDrhBRxxtM7kbR7eSMbxlRITXXrG2BYyVmjfrMdNGh9KjPlGLaSYusGjiKtCWIrLnhk9X5r65cdCvs3UfHqFd_dNtEeFl_M1UXIhYsh7y9DBjvmhMCh6PlcBsb9P-2G5qvTUVaUB7Xo4_dUok0EibFd2tIqdrEKEmhTef5Xv22FjxyV2vVrhPt4kwrjVAE6JDRr-LVGt_09q4z7tKiBHnBYp7-k4WJXURZNMF8YoomfSsJEpgUM_8xmrPpIdiH7A7Er6_aBsqgS9YJWo7vyzDWnx0FFOzLGwuqEEB6z3ErPwXLew0i8OQkk2djQmSBWfc47_qBSxqENZVbmRnW6VBDLY0fkBsSxx9-x5Ji8_nPUxwobjxipcT1abhyKHzvcdVSO725clOHiYuvW5fe3Q68sYqzANAcRaqWRFvaFHz7zJWC-l13Q6vozo6xxrz-kX2hAC9ksDYBIwA_o5gcuP-Z2Ozv_lrhZHkpyXwtfJW84QD_ADAVfZ_jDheUGve0NYvmcVeedYomnbNCRWwvUer2eNIrddE',
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
