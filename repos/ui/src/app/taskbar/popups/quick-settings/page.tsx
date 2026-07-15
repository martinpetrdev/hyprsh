"use client";

import { TBQSPHBattery } from "@/components/taskbar/popups/quick-settings/H_Battery";
import { TBQSPHPower } from "@/components/taskbar/popups/quick-settings/H_Power";
import { TBQSPWifi } from "@/components/taskbar/popups/quick-settings/Wifi";

export default function Page() {
  return (
    <div className="w-80 flex flex-col p-2 gap-2" id="popup-shell">
      <div className="flex flex-row items-center justify-between">
        <div>
          <TBQSPHBattery />
        </div>
        <div>
          <TBQSPHPower />
        </div>
      </div>
      <div className="w-full h-full grid grid-cols-2 gap-2">
        <TBQSPWifi />
      </div>
    </div>
  );
}
