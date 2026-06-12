import { Global, Module } from '@nestjs/common';
import { HyprlandController } from './hyprland.controller';
import { HyprlandService } from './hyprland.service';

@Global()
@Module({
  controllers: [HyprlandController],
  providers: [HyprlandService],
  exports: [HyprlandService],
})
export class HyprlandModule {}
