import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import configuration from './config';

const config = configuration();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(config.server.port);
}
bootstrap();
