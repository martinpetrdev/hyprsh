"use client";

import { useTBWidgetContext } from "@/context/taskbar/TBWidgetContext";
import { TBText } from "./TBText";

interface ITBWidgetProps {
  id: string;
}

export function TBWidget(props: ITBWidgetProps) {
  const context = useTBWidgetContext();
  const definition = context.widgets.find((w) => w.id === props.id);

  if (definition == null) return <TBText>INVALID WIDGET ID</TBText>;

  const Comp = definition.component;

  return <Comp />;
}
