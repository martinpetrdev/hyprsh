import { API } from "@/classes/API";
import { TBIcon } from "@/components/base/taskbar/TBIcon";
import { useBattery } from "@/hooks/modules/useBattery";
import { useCallback, useEffect, useState } from "react";
import {
  MdBattery0Bar,
  MdBattery20,
  MdBattery2Bar,
  MdBattery30,
  MdBattery50,
  MdBattery60,
  MdBattery80,
  MdBattery90,
  MdBatteryAlert,
  MdBatteryCharging20,
  MdBatteryCharging30,
  MdBatteryCharging50,
  MdBatteryCharging60,
  MdBatteryCharging80,
  MdBatteryCharging90,
  MdBatteryChargingFull,
  MdBatteryFull,
  MdBatteryStd,
  MdBolt,
  MdCable,
  MdPower,
} from "react-icons/md";

const iconConfig = {
  0: MdBattery0Bar,
  20: MdBattery20,
  30: MdBattery30,
  50: MdBattery50,
  60: MdBattery60,
  80: MdBattery80,
  90: MdBattery90,
  100: MdBatteryFull,
  ch0: MdPower,
  ch20: MdBatteryCharging20,
  ch30: MdBatteryCharging30,
  ch50: MdBatteryCharging50,
  ch60: MdBatteryCharging60,
  ch80: MdBatteryCharging80,
  ch90: MdBatteryCharging90,
  ch100: MdBatteryChargingFull,
};

export function TBQSWBattery() {
  const battery = useBattery();

  if (!battery._initialized) return <></>;

  // TODO: Refactor - I am going to sleep (really, I am lazy)
  const icon = battery.charging
    ? battery.charge == 100
      ? iconConfig.ch100
      : battery.charge >= 90
        ? iconConfig.ch90
        : battery.charge >= 80
          ? iconConfig.ch80
          : battery.charge >= 60
            ? iconConfig.ch60
            : battery.charge >= 50
              ? iconConfig.ch50
              : battery.charge >= 30
                ? iconConfig.ch30
                : battery.charge >= 20
                  ? iconConfig.ch20
                  : iconConfig.ch0
    : battery.charge >= 100
      ? iconConfig[100]
      : battery.charge >= 90
        ? iconConfig[90]
        : battery.charge >= 80
          ? iconConfig[80]
          : battery.charge >= 60
            ? iconConfig[60]
            : battery.charge >= 50
              ? iconConfig[50]
              : battery.charge >= 30
                ? iconConfig[30]
                : battery.charge >= 20
                  ? iconConfig[20]
                  : iconConfig[0];

  return <TBIcon icon={icon} />;
}
