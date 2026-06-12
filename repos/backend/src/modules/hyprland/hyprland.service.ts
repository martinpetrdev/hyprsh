import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { spawn } from 'child_process';
import { createConnection, Socket } from 'net';
import { join } from 'path';
import { Subject } from 'rxjs';

export interface HyprlandEvent {
  event: string;
  data: string;
}

@Injectable()
export class HyprlandService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HyprlandService.name);

  private eventSocket: Socket | null = null;
  private eventSocketReconnectTimer: ReturnType<typeof setTimeout> | null =
    null;
  private eventSocketDestroyed = false;

  readonly events$ = new Subject<HyprlandEvent>();

  onModuleInit() {
    this.connectSocket();
  }

  onModuleDestroy() {
    this.eventSocketDestroyed = true;

    if (this.eventSocketReconnectTimer)
      clearTimeout(this.eventSocketReconnectTimer);

    if (this.eventSocket) {
      this.eventSocket.destroy();
      this.eventSocket = null;
    }

    this.events$.complete();
  }

  private getEventSocketPath(): string {
    const xdgRuntimeDir =
      process.env.XDG_RUNTIME_DIR ?? `/run/user/${process.getuid?.() ?? ''}`;
    const instanceSig = process.env.HYPRLAND_INSTANCE_SIGNATURE;

    if (!instanceSig)
      throw new Error(
        'HYPRLAND_INSTANCE_SIGNATURE not set — is Hyprland running?',
      );

    return join(xdgRuntimeDir, 'hypr', instanceSig, '.socket2.sock');
  }

  private connectSocket() {
    if (this.eventSocketDestroyed) return;

    try {
      const path = this.getEventSocketPath();
      this.logger.log(`Connecting to Hyprland event socket: ${path}`);

      const socket = createConnection({ path });
      this.eventSocket = socket;

      let buffer = '';

      socket.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');

        // Keep the last (possibly incomplete) line in the buffer
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line) continue;

          const separatorIndex = line.indexOf('>>');
          if (separatorIndex === -1) continue;

          const event = line.substring(0, separatorIndex);
          const data = line.substring(separatorIndex + 2);

          this.events$.next({ event, data });
        }
      });

      socket.on('error', (err) => {
        this.logger.error(`Hyprland socket error: ${err.message}`);
      });

      socket.on('close', () => {
        this.logger.warn('Hyprland socket closed');
        this.eventSocket = null;

        this.scheduleReconnect();
      });
    } catch (err) {
      this.logger.error(`Failed to connect to Hyprland socket: ${err}`);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.eventSocketDestroyed) return;

    this.eventSocketReconnectTimer = setTimeout(() => {
      this.eventSocketReconnectTimer = null;
      this.connectSocket();
    }, 1000);
  }

  async runCtl(args: string[]): Promise<string> {
    return await new Promise((res) => {
      const proc = spawn('hyprctl', [...args, '-j']);

      let buf = '';

      proc.stdout.on('data', (d) => {
        buf += d.toString();
      });

      proc.on('error', (e) => {
        res(JSON.stringify({ error: e.message }));
      });

      proc.on('exit', () => {
        res(buf);
      });
    });
  }
}
