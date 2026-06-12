import { IconType } from "react-icons";

interface ITBIconProps {
  icon: IconType
}

export function TBIcon(props: ITBIconProps) {
  return <props.icon className="text-ctp-lavender" />;
}