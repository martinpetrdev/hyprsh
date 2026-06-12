"use client";

import { ITBWidgetDefinition } from "@/types/taskbar/widget";
import { ComponentType } from "react";
import { TBQSWWifi } from "./quick-settings/Wifi";
import { TBQSWBluetooth } from "./quick-settings/Bluetooth";
import { TBQSWBattery } from "./quick-settings/Battery";

export class TBQuickSettingsWidget implements ITBWidgetDefinition {
  public readonly id: string = "quick-settings";

  public readonly component: ComponentType = TBQuickSettingsWidgetComponent;
}

function TBQuickSettingsWidgetComponent() {
  return (
    <div className="flex flex-row gap-2 items-center">
      <TBQSWWifi />
      <TBQSWBluetooth />
      <TBQSWBattery />
    </div>
  );
}
