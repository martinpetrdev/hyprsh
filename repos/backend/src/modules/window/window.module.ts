import { Module } from '@nestjs/common';
import { WindowController } from './window.controller';
import { WindowService } from './window.service';
import { HyprlandModule } from '../hyprland/hyprland.module';

@Module({
  imports: [HyprlandModule],
  controllers: [WindowController],
  providers: [WindowService],
})
export class WindowModule {}
