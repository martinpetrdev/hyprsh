import { Injectable } from '@nestjs/common';
import { CommandService } from 'src/services/command.service';

@Injectable()
export class PowerService {
  constructor(private readonly commandService: CommandService) {}

  async getBatteryStats(batteryId: string): Promise<{
    state: string;
    percentage: number;
  }> {
    const path = `/org/freedesktop/UPower/devices/battery_${batteryId}`;
    const output = await this.commandService.execAsync('upower', ['-i', path]);
    const lines = output.split('\n').filter((l) => l.trim().length > 0);

    const stats = Object.fromEntries(
      lines.map((l) => l.split(':').map((p) => p.trim())),
    );

    return {
      state: stats.state,
      percentage: Number(stats.percentage.trim().replaceAll('%', '')),
    };
  }
}
