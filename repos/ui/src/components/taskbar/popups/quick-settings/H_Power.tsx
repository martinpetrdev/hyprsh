import { TBIcon } from "@/components/base/taskbar/TBIcon";
import { PiPower } from "react-icons/pi";

export function TBQSPHPower() {
  return (
    <button className="flex flex-row gap-2 items-center justify-center p-2 bg-ctp-surface0/50 rounded-md mr-0.5">
      <TBIcon icon={PiPower} className="text-ctp-text size-3" />
    </button>
  );
}
