import { Module } from '@nestjs/common';
import { WindowModule } from './modules/window/window.module';
import { HyprlandModule } from './modules/hyprland/hyprland.module';

@Module({
  imports: [WindowModule, HyprlandModule],
})
export class AppModule {}
