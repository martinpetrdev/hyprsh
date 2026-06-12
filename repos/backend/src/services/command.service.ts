import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';

@Injectable()
export class CommandService {
  async execAsync(command: string, args: string[] = []) {
    return new Promise<string>((resolve) => {
      const proc = spawn(command, args);
      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('error', (err) => {
        console.error(stderr);
        resolve(stderr);
      });

      proc.on('close', (code) => {
        if (code === 0) resolve(stdout);
        else resolve(stderr);
      });
    });
  }
}
