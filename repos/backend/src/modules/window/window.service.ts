import { Injectable } from '@nestjs/common';
import { HyprlandService } from 'src/modules/hyprland/hyprland.service';

@Injectable()
export class WindowService {
  constructor(private readonly hyprlandService: HyprlandService) {}

  async getActiveWindowTitle(): Promise<{ title: string }> {
    const res = await this.hyprlandService.runCtl(['activewindow']);

    return { title: JSON.parse(res).title ?? '' };
  }
}
