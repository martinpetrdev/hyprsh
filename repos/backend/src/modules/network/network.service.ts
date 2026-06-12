import { Injectable } from '@nestjs/common';
import { CommandService } from 'src/services/command.service';

@Injectable()
export class NetworkService {
  constructor(private readonly commandService: CommandService) {}

  async getWifiDetails(): Promise<{
    ssid: string;
    strength: number;
  } | null> {
    const output = await this.commandService.execAsync('nmcli', [
      '-t',
      '-f',
      'active,ssid,signal,rate',
      'dev',
      'wifi',
    ]);

    const line = output.split('\n').find((l) => l.startsWith('yes:'));
    if (!line) return null;

    const [_active, ssid, signal] = line.split(':');

    return { ssid, strength: parseInt(signal) };
  }

  async getBluetoothDetails(): Promise<{
    powered: boolean;
    connected: boolean;
  }> {
    const showOutput = await this.commandService.execAsync('bluetoothctl', [
      'show',
    ]);

    const lines = showOutput.split('\n').filter((l) => l.trim().length > 0);
    const powered =
      lines
        .find((l) => l.trim().startsWith('Powered:'))
        ?.split(':')?.[1]
        ?.trim() == 'yes';

    const devicesOutput = await this.commandService.execAsync('bluetoothctl', [
      'devices',
      'Connected',
    ]);

    const devicesLines = devicesOutput
      .split('\n')
      .filter((l) => l.trim().length > 0);
    const connected = devicesLines.length > 0;

    return {
      powered,
      connected,
    };
  }
}
