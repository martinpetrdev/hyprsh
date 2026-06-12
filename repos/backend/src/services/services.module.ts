import { Global, Module } from '@nestjs/common';
import { CommandService } from './command.service';

@Global()
@Module({
  imports: [],
  providers: [CommandService],
  exports: [CommandService],
})
export class ServicesModule {}
