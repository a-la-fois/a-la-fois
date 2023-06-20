import { Injectable } from '@nestjs/common';
import { Logger } from 'pino';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LoggerService extends Logger {}

@Injectable()
export class LoggerService {}
