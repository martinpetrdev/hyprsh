import { TBIcon } from "@/components/base/taskbar/TBIcon";
import { useBattery } from "@/hooks/modules/useBattery";
import { PiBatteryCharging, PiBatteryFull } from "react-icons/pi";

export function TBQSPHBattery() {
  const battery = useBattery();

  return (
    <div className="flex flex-row gap-2 items-center justify-center px-2 py-1 bg-ctp-surface0/50 rounded-md">
      <TBIcon
        icon={battery.charging ? PiBatteryCharging : PiBatteryFull}
        className="text-ctp-text size-3"
      />
      <p className="text-sm text-ctp-text">{battery.charge}%</p>
    </div>
  );
}
