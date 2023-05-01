import { errorEvent, ErrorMessage } from '../messages';

export abstract class MessageError {
    docId: string;
    abstract message: string;

    constructor(docId?: string) {
        this.docId = docId;
    }

    toMessage(): ErrorMessage {
        let message = {
            event: 'error' as const,
            data: {
                message: this.message,
            },
        };

        if (this.docId) {
            message['data']['docId'] = this.docId;
        }

        return message;
    }
}
