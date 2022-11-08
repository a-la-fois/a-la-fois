# docClient

## Usage
```ts
import { Client } from '@a-la-fois/doc-client';

const client = new Client({
    url: 'wss://ws.service.com',
});

// get doc container with  synchronized document
const docContainer = await client.getDoc('docId');

// get yjs document
const yjsDoc = docContainer.doc;
// do with it whatever you want
yjsDoc.getText('Text');
yjsDoc.insert(0, 'my text')
```
