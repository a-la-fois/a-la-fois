import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const origin = config.cors.origin
        ? config.cors.origin.map((str) => {
              const strEscaped = str.replace(/\./g, '\\.');
              return new RegExp(strEscaped);
          })
        : false;

    app.enableCors({
        origin,
    });
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );

    await app.listen(config.server.port);
}
bootstrap();
