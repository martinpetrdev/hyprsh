import { ReactNode } from "react";

interface ITBWidgetGroupProps {
  children: ReactNode | ReactNode[];
  gap?: number;
}

export function TBWidgetGroup(props: ITBWidgetGroupProps) {
  const defaultedProps = {
    ...props,
    gap: props.gap ?? 2,
  };

  return (
    <div className={`flex flex-row gap-${defaultedProps.gap} items-center`}>
      {props.children}
    </div>
  );
}
