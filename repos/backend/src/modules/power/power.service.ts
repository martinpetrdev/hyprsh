import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { CommandService } from 'src/services/command.service';
import { DbusService } from 'src/services/dbus.service';
import { EventsService } from '../events/events.service';

@Injectable()
export class PowerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PowerService.name);

  private cleanups: (() => void)[] = [];

  constructor(
    private readonly dbusService: DbusService,
    private readonly eventsService: EventsService,
  ) {}

  async onModuleInit() {
    const upower = await this.dbusService.getInterface(
      'org.freedesktop.UPower',
      '/org/freedesktop/UPower',
      'org.freedesktop.UPower',
    );
    const devices: string[] = await upower.EnumerateDevices();

    const batteryPaths = devices.filter((path) =>
      path.includes('/devices/battery_'),
    );

    const linePowerPaths = devices.filter(
      (path) =>
        path.includes('/devices/line_power_') || path.includes('/devices/ac_'),
    );

    for (const path of batteryPaths) {
      const parts = path.split('/');
      const name = parts[parts.length - 1];
      const batteryId = name.replace('battery_', '');

      this.logger.log(
        `Listening for battery events on: ${path} (ID: ${batteryId})`,
      );

      const cleanup = await this.dbusService.addListener(
        'org.freedesktop.UPower',
        path,
        async (prop: string) => {
          if (prop === 'State' || prop === 'Percentage')
            await this.$updateBatteryStats(batteryId);
        },
      );

      if (cleanup) this.cleanups.push(cleanup);
    }

    for (const path of linePowerPaths) {
      this.logger.log(`Listening for AC adapter events on: ${path}`);

      const cleanup = await this.dbusService.addListener(
        'org.freedesktop.UPower',
        path,
        async (prop: string) => {
          if (prop === 'Online') {
            this.logger.log(
              `AC adapter state changed (${prop}), triggering immediate battery refresh`,
            );

            for (const batteryPath of batteryPaths) {
              const parts = batteryPath.split('/');
              const name = parts[parts.length - 1];
              const batteryId = name.replace('battery_', '');

              await this.$updateBatteryStats(batteryId);
            }
          }
        },
      );

      if (cleanup) this.cleanups.push(cleanup);
    }

    for (const path of batteryPaths) {
      const parts = path.split('/');
      const name = parts[parts.length - 1];
      const batteryId = name.replace('battery_', '');

      await this.$updateBatteryStats(batteryId);
    }
  }

  onModuleDestroy() {
    for (const cleanup of this.cleanups) {
      cleanup();
    }

    this.cleanups = [];
  }

  async getBatteryStats(batteryId: string): Promise<{
    state: string;
    percentage: number;
  }> {
    const path = `/org/freedesktop/UPower/devices/battery_${batteryId}`;
    const properties = await this.dbusService.getPropertiesInterface(
      'org.freedesktop.UPower',
      path,
    );

    const stateVariant = await properties.Get(
      'org.freedesktop.UPower.Device',
      'State',
    );
    const percentageVariant = await properties.Get(
      'org.freedesktop.UPower.Device',
      'Percentage',
    );

    const stateEnum = stateVariant.value as number;
    const percentage = percentageVariant.value as number;

    const states: Record<number, string> = {
      0: 'unknown',
      1: 'charging',
      2: 'discharging',
      3: 'empty',
      4: 'fully-charged',
      5: 'pending-charge',
      6: 'pending-discharge',
    };

    return {
      state: states[stateEnum] ?? 'unknown',
      percentage: Math.round(percentage),
    };
  }

  private async $updateBatteryStats(batteryId: string) {
    const stats = await this.getBatteryStats(batteryId);

    this.eventsService.emit(`battery.${batteryId}.state`, stats.state);
    this.eventsService.emit(
      `battery.${batteryId}.percentage`,
      stats.percentage,
    );

    if (batteryId === 'BAT0') {
      this.eventsService.emit('battery.state', stats.state);
      this.eventsService.emit('battery.percentage', stats.percentage);
    }
  }
}
