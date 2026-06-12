"use client";

import { TBIcon } from "@/components/base/taskbar/TBIcon";
import { TBText } from "@/components/base/taskbar/TBText";
import { ITBWidgetDefinition } from "@/types/taskbar/widget";
import { ComponentType } from "react";
import { SiFedora } from "react-icons/si";

export class TBWindowTitleWidget implements ITBWidgetDefinition {
  public readonly id: string = "window-title";

  public readonly component: ComponentType = TBWindowTitleWidgetComponent;
}

function TBWindowTitleWidgetComponent() {
  return <TBText>My awesome window title</TBText>;
}
