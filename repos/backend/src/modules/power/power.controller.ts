import { Controller, Get, Param } from '@nestjs/common';
import { PowerService } from './power.service';

@Controller('/power')
export class PowerController {
  constructor(private readonly powerService: PowerService) {}

  @Get('/battery/:id/stats')
  async getBatteryStats(@Param('id') batteryId: string) {
    return await this.powerService.getBatteryStats(batteryId);
  }
}
