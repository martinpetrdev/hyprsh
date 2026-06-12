"use client";

import { TBIcon } from "@/components/base/taskbar/TBIcon";
import { TBText } from "@/components/base/taskbar/TBText";
import { ITBWidgetDefinition } from "@/types/taskbar/widget";
import { ComponentType } from "react";
import { SiFedora } from "react-icons/si";

export class TBOsIconWidget implements ITBWidgetDefinition {
  public readonly id: string = "os-icon";

  public readonly component: ComponentType = TBOsIconWidgetComponent;
}

function TBOsIconWidgetComponent() {
  return <TBIcon icon={SiFedora} />;
}
