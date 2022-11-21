import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConsumerService } from '../consumer/consumer.service';

@Injectable()
export class ConsumerExtractorMiddleware implements NestMiddleware {
    constructor(private readonly consumerService: ConsumerService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        console.log('middleware');
        const token: string | undefined = req.headers['authorization'];
        if (token) {
            try {
                const [headers, payload, sign] = token.split('.');
                const payloadData = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
                const publicKey = await this.consumerService.getConsumer(payloadData.iss);
                console.log(publicKey);
                req['publicKey'] = publicKey;
                next();
            } catch (Exception) {
                throw new UnauthorizedException('JWT token has wrong format.');
            }
        }
        throw new UnauthorizedException('No token provided.');
    }
}
