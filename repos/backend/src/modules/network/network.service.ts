import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CommandService } from 'src/services/command.service';
import { DbusService } from 'src/services/dbus.service';
import { EventsService } from '../events/events.service';

export enum EWifiState {
  NM_STATE_UNKNOWN = 0,
  NM_STATE_ASLEEP = 10,
  NM_STATE_DISCONNECTED = 20,
  NM_STATE_DISCONNECTING = 30,
  NM_STATE_CONNECTING = 40,
  NM_STATE_CONNECTED_LOCAL = 50,
  NM_STATE_CONNECTED_SITE = 60,
  NM_STATE_CONNECTED_GLOBAL = 70,
}

@Injectable()
export class NetworkService implements OnModuleInit {
  private dbusWifiDevicePath: string | null = null;
  private activeApListenerCleanup: (() => void) | null = null;

  private readonly logger = new Logger(NetworkService.name);

  constructor(
    private readonly commandService: CommandService,
    private readonly dbusService: DbusService,
    private readonly eventsService: EventsService,
  ) {}

  async onModuleInit() {
    this.dbusService.addListener(
      'org.freedesktop.NetworkManager',
      '/org/freedesktop/NetworkManager',
      (prop: string, val: any) => {
        if (prop == 'WirelessEnabled') this.$handleWifiWirelessEnabled(val);
      },
    );

    const wifiPath = await this.$getWifiDBusPath();
    if (!wifiPath) {
      this.logger.warn('Could not find wifi device');

      return;
    }

    this.logger.log(`Found wifi dbus path: ${wifiPath}`);

    this.dbusService.addListener(
      'org.freedesktop.NetworkManager',
      wifiPath,
      (prop: string, val: any) => {
        if (prop == 'ActiveAccessPoint' || prop == 'State')
          this.$updateWifiConnectionState();
      },
    );

    await this.$updateWifiConnectionState();

    try {
      const wifiDevice = await this.dbusService.getInterface(
        'org.freedesktop.NetworkManager',
        wifiPath,
        'org.freedesktop.NetworkManager.Device.Wireless',
      );

      wifiDevice.on('AccessPointAdded', () => this.$emitWifiNetworks());
      wifiDevice.on('AccessPointRemoved', () => this.$emitWifiNetworks());
    } catch (err) {
      this.logger.error(`Failed to register AP signals: ${err.message}`);
    }
  }

  async getWifiDetails(): Promise<{
    ssid: string;
    strength: number;
  } | null> {
    try {
      const wifiPath = await this.$getWifiDBusPath();
      if (!wifiPath) return null;

      const deviceInterface = await this.dbusService.getPropertiesInterface(
        'org.freedesktop.NetworkManager',
        wifiPath,
      );

      const activeApVariant = await deviceInterface.Get(
        'org.freedesktop.NetworkManager.Device.Wireless',
        'ActiveAccessPoint',
      );
      const activeApPath = activeApVariant.value;

      if (!activeApPath || activeApPath === '/') return null;

      return await this.$getAccessPointDetails(activeApPath);
    } catch (err) {
      this.logger.error(`Failed to get wifi details from DBus: ${err.message}`);

      return null;
    }
  }

  async listWifi(rescan: boolean = false): Promise<
    {
      active: boolean;
      ssid: string;
      signal: number;
      open: boolean;
    }[]
  > {
    try {
      const wifiPath = await this.$getWifiDBusPath();
      if (!wifiPath) return [];

      const status = await this.getWifiStatus();
      if (!status.powered) return [];

      const wifiDevice = await this.dbusService.getInterface(
        'org.freedesktop.NetworkManager',
        wifiPath,
        'org.freedesktop.NetworkManager.Device.Wireless',
      );

      if (rescan) {
        try {
          await wifiDevice.RequestScan({});
        } catch (scanErr) {
          this.logger.warn(`Failed to request scan: ${scanErr.message}`);
        }
      }

      const aps: string[] = await wifiDevice.GetAccessPoints();
      const devProps = await this.dbusService.getPropertiesInterface(
        'org.freedesktop.NetworkManager',
        wifiPath,
      );
      const activeApVariant = await devProps.Get(
        'org.freedesktop.NetworkManager.Device.Wireless',
        'ActiveAccessPoint',
      );
      const activeApPath = activeApVariant?.value;

      const map = new Map<
        string,
        {
          active: boolean;
          ssid: string;
          signal: number;
          open: boolean;
        }
      >();

      for (const apPath of aps) {
        try {
          const apDetails = await this.$getAccessPointDetails(apPath);
          const active = apPath === activeApPath;

          const existing = map.get(apDetails.ssid);

          if (
            !existing ||
            active ||
            (!existing.active && apDetails.strength > existing.signal)
          ) {
            map.set(apDetails.ssid, {
              active: existing?.active || active,
              ssid: apDetails.ssid,
              signal: apDetails.strength,
              open: apDetails.open,
            });
          }
        } catch (apErr) {
          continue;
        }
      }

      return Array.from(map.values()).sort((a, b) => {
        if (a.active && !b.active) return -1;
        if (!a.active && b.active) return 1;
        return b.signal - a.signal;
      });
    } catch (err) {
      this.logger.error(`Failed to list wifi via DBus: ${err.message}`);

      return [];
    }
  }

  async connectWifi(ssid: string) {
    await this.commandService.execAsync('nmcli', [
      'device',
      'wifi',
      'connect',
      ssid,
      '--ask',
    ]);
  }

  async getWifiStatus(): Promise<{
    powered: boolean;
  }> {
    try {
      const nmProps = await this.dbusService.getPropertiesInterface(
        'org.freedesktop.NetworkManager',
        '/org/freedesktop/NetworkManager',
      );
      const wirelessEnabledVariant = await nmProps.Get(
        'org.freedesktop.NetworkManager',
        'WirelessEnabled',
      );

      return {
        powered: Boolean(wirelessEnabledVariant.value),
      };
    } catch (err) {
      this.logger.error(`Failed to get wifi status from DBus: ${err.message}`);

      return {
        powered: false,
      };
    }
  }

  async toggleWifiPower(enabled: boolean) {
    await this.commandService.execAsync('nmcli', [
      'radio',
      'wifi',
      enabled ? 'on' : 'off',
    ]);
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

  // --- DBus ---
  private async $getWifiDBusPath() {
    if (this.dbusWifiDevicePath) return this.dbusWifiDevicePath;

    const int = await this.dbusService.getInterface(
      'org.freedesktop.NetworkManager',
      '/org/freedesktop/NetworkManager',
      'org.freedesktop.NetworkManager',
    );
    const devices: string[] = await int.GetDevices();

    for (const device of devices) {
      const deviceInterface: any =
        await this.dbusService.getPropertiesInterface(
          'org.freedesktop.NetworkManager',
          device,
        );
      const deviceType = await deviceInterface.Get(
        'org.freedesktop.NetworkManager.Device',
        'DeviceType',
      );

      // 2 - NM_DEVICE_TYPE_WIFI
      if (deviceType.value == 2) {
        this.dbusWifiDevicePath = device;

        return device;
      }
    }

    return null;
  }

  // --- Events ---
  private $handleWifiWirelessEnabled(value: boolean) {
    this.eventsService.emit('wifi.power', value);
    this.$updateWifiConnectionState();

    if (value)
      setTimeout(async () => {
        try {
          const wifiPath = await this.$getWifiDBusPath();
          if (wifiPath) {
            const wifiDevice = await this.dbusService.getInterface(
              'org.freedesktop.NetworkManager',
              wifiPath,
              'org.freedesktop.NetworkManager.Device.Wireless',
            );

            await wifiDevice.RequestScan({});
          }
        } catch (err) {}
      }, 1000);
  }

  private async $updateWifiConnectionState() {
    if (this.activeApListenerCleanup) {
      this.activeApListenerCleanup();
      this.activeApListenerCleanup = null;
    }

    try {
      const wifiPath = await this.$getWifiDBusPath();
      if (!wifiPath) {
        this.eventsService.emit('wifi.ssid', null);
        this.eventsService.emit('wifi.strength', null);
        this.$emitWifiNetworks();
        return;
      }

      const devProps = await this.dbusService.getPropertiesInterface(
        'org.freedesktop.NetworkManager',
        wifiPath,
      );

      const stateVariant = await devProps.Get(
        'org.freedesktop.NetworkManager.Device',
        'State',
      );
      const state = stateVariant.value;

      if (state !== 100) {
        this.eventsService.emit('wifi.ssid', null);
        this.eventsService.emit('wifi.strength', null);
        this.$emitWifiNetworks();
        return;
      }

      const activeApVariant = await devProps.Get(
        'org.freedesktop.NetworkManager.Device.Wireless',
        'ActiveAccessPoint',
      );
      const activeApPath = activeApVariant.value;

      if (!activeApPath || activeApPath === '/') {
        this.eventsService.emit('wifi.ssid', null);
        this.eventsService.emit('wifi.strength', null);
        this.$emitWifiNetworks();

        return;
      }

      const { ssid, strength } =
        await this.$getAccessPointDetails(activeApPath);

      this.eventsService.emit('wifi.ssid', ssid);
      this.eventsService.emit('wifi.strength', strength);

      this.activeApListenerCleanup = await this.dbusService.addListener(
        'org.freedesktop.NetworkManager',
        activeApPath,
        (prop: string, val: any) => {
          if (prop === 'Strength') {
            this.eventsService.emit('wifi.strength', val);
            this.$emitWifiNetworks();
          }

          if (prop === 'Ssid') {
            const newSsid = val.toString('utf-8');
            this.eventsService.emit('wifi.ssid', newSsid);
            this.$emitWifiNetworks();
          }
        },
      );
    } catch (err) {
      this.logger.error(
        `Failed to update wifi connection state: ${err.message}`,
      );
      this.eventsService.emit('wifi.ssid', null);
      this.eventsService.emit('wifi.strength', null);
    } finally {
      this.$emitWifiNetworks();
    }
  }

  private async $getAccessPointDetails(dbusPath: string): Promise<{
    ssid: string;
    strength: number;
    open: boolean;
  }> {
    const apInterface = await this.dbusService.getPropertiesInterface(
      'org.freedesktop.NetworkManager',
      dbusPath,
    );

    const ssidVariant = await apInterface.Get(
      'org.freedesktop.NetworkManager.AccessPoint',
      'Ssid',
    );
    const ssid = ssidVariant.value.toString('utf-8');

    const strengthVariant = await apInterface.Get(
      'org.freedesktop.NetworkManager.AccessPoint',
      'Strength',
    );
    const strength = strengthVariant.value;

    const wpaFlagsVariant = await apInterface.Get(
      'org.freedesktop.NetworkManager.AccessPoint',
      'WpaFlags',
    );
    const rsnFlagsVariant = await apInterface.Get(
      'org.freedesktop.NetworkManager.AccessPoint',
      'RsnFlags',
    );
    const open = wpaFlagsVariant.value === 0 && rsnFlagsVariant.value === 0;

    return { ssid, strength, open };
  }

  private async $emitWifiNetworks() {
    try {
      const networks = await this.listWifi();
      this.eventsService.emit('wifi.networks', networks);
    } catch (err) {
      this.logger.error(`Failed to emit wifi networks: ${err.message}`);
    }
  }
}
