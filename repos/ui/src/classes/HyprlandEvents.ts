"use client";

import { CFG_BACKEND_URL } from "@/config";

export class HyprlandEvents {
  private static _eventSource: EventSource;

  static get eventSource() {
    if (!this._eventSource)
      this._eventSource = new EventSource(
        `${CFG_BACKEND_URL}/api/v1/hyprland/events`,
      );

    return this._eventSource;
  }

  static on(eventId: string, callback: (data: any) => void) {
    const handler = (e: MessageEvent) => {
      callback(e.data);
    };

    this.eventSource.addEventListener(eventId, handler);

    return {
      off: () => this.eventSource.removeEventListener(eventId, handler),
    };
  }
}
