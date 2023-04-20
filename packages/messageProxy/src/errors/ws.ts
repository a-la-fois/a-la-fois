import { MessageError } from './base';

export class NotJoinedError extends MessageError {
    message = 'Client is not joined to the document, check joinResponse.';
}
