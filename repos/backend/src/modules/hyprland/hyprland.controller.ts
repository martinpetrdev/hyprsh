import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { HyprlandService } from 'src/modules/hyprland/hyprland.service';

@Controller('/hyprland')
export class HyprlandController {
  constructor(private readonly hyprlandService: HyprlandService) {}

  @Sse('/events')
  events(): Observable<MessageEvent> {
    return this.hyprlandService.events$.pipe(
      map(
        ({ event, data }): MessageEvent => ({
          type: event,
          data: data,
        }),
      ),
    );
  }
}
