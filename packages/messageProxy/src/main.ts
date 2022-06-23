import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ProtobufWsAdapter } from '../../nestCommon/src/protobufWSAdapter/protobufWsAdapter';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new ProtobufWsAdapter(app))
  await app.listen(3000);
}
bootstrap();
