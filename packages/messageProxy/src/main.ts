import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProtobufWsAdapter } from '@a-la-fois/nest-common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new ProtobufWsAdapter(app));
  await app.listen(3000);
}
bootstrap();
