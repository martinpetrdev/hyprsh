import { Module } from '@nestjs/common';
import { WindowModule } from './modules/window/window.module';
import { HyprlandModule } from './modules/hyprland/hyprland.module';
import { NetworkModule } from './modules/network/network.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [ServicesModule, WindowModule, HyprlandModule, NetworkModule],
})
export class AppModule {}
