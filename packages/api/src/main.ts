import { NestFactory } from '@nestjs/core';
import mongoose from 'mongoose';
import { AppModule } from './app.module';
import configuration from './config';

const config = configuration();

async function bootstrap() {
    mongoose.connect(config.mongo.uri);

    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');

    await app.listen(config.server.port);
}
bootstrap();
