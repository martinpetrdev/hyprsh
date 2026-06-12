import { Controller, Get } from '@nestjs/common';
import { NetworkService } from './network.service';

@Controller('/network')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Get('/wifi/details')
  async getWifiDetails() {
    return await this.networkService.getWifiDetails();
  }

  @Get('/bluetooth/details')
  async getBluetoothDetails() {
    return await this.networkService.getBluetoothDetails();
  }
}
