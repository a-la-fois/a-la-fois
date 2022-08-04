import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DaprClient } from '@dapr/dapr';

@Injectable()
export class DaprService {
  private daprClient: DaprClient;

  constructor(
    private readonly configService: ConfigService
  ) {
    const daprHost = this.configService.get<string>('dapr.host');
    const daprPort = this.configService.get<string>('dapr.port');

    this.daprClient = new DaprClient(daprHost, daprPort);
  }
}