import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // @ts-ignore
    app.useWebSocketAdapter(new WsAdapter(app));
    await app.listen(3000);
}
bootstrap();
