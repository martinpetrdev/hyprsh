import { Module } from '@nestjs/common';
import { PowerController } from './power.controller';
import { PowerService } from './power.service';

@Module({
  imports: [],
  controllers: [PowerController],
  providers: [PowerService],
})
export class PowerModule {}
