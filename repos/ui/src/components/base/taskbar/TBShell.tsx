"use client";

import { TBWidgetContextProvider } from "@/context/taskbar/TBWidgetContext";
import { ITBWidgetDefinition } from "@/types/taskbar/widget";
import { ReactNode } from "react";

interface ITBShellProps {
  children: ReactNode | ReactNode[];
  widgets: (new () => ITBWidgetDefinition)[];
}

export function TBShell(props: ITBShellProps) {
  return (
    <TBWidgetContextProvider widgets={props.widgets.map((W) => new W())}>
      <div className="w-screen h-screen">
        <div className="w-full h-full bg-ctp-base px-5 flex flex-row items-center justify-between">
          {props.children}
        </div>
      </div>
    </TBWidgetContextProvider>
  );
}
