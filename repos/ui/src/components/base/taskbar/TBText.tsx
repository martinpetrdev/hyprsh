import { ReactNode } from "react";

interface ITBTextProps {
  children: ReactNode | ReactNode[];
}

export function TBText(props: ITBTextProps) {
  return <p className="text-ctp-subtext0 text-sm">{props.children}</p>;
}
