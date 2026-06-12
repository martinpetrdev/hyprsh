import { Controller, Get } from '@nestjs/common';
import { WindowService } from './window.service';

@Controller('/window')
export class WindowController {
  constructor(private readonly hyprlandService: WindowService) {}

  @Get('/active/title')
  async getActiveWindowTitle() {
    return await this.hyprlandService.getActiveWindowTitle();
  }
}
