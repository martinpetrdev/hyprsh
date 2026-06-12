import { ITBWidgetDefinition } from "@/types/taskbar/widget";
import { createContext, ReactNode, useContext } from "react";

export interface ITBWidgetContextValue {
  widgets: ITBWidgetDefinition[];
}

export const TBWidgetContext = createContext<ITBWidgetContextValue>(
  null as unknown as ITBWidgetContextValue,
);

interface ITBWidgetContextProviderProps {
  children: ReactNode | ReactNode[];
  widgets: ITBWidgetDefinition[];
}

export function TBWidgetContextProvider(props: ITBWidgetContextProviderProps) {
  return (
    <TBWidgetContext.Provider
      value={{
        widgets: props.widgets,
      }}
    >
      {props.children}
    </TBWidgetContext.Provider>
  );
}

export function useTBWidgetContext() {
  return useContext(TBWidgetContext);
}
