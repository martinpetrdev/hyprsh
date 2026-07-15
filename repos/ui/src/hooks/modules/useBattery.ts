import { useEffect } from "react";
import { useBatteryStore } from "../stores/useBatteryStore";
import { API } from "@/classes/API";
import { useEvent } from "./useEvents";

export function useBattery() {
  const store = useBatteryStore();
  useEvent("battery.state", (state: string) => {
    store.setCharging(state !== "discharging");
  });
  useEvent("battery.percentage", (percentage: number) => {
    store.setCharge(percentage);
  });

  const fetchCharge = async () => {
    const result = await API.get<{
      state: "charging" | "discharging" | "full";
      percentage: number;
    }>("/v1/power/battery/BAT0/stats");
    if (!result || "error" in result) {
      return;
    }

    store.setCharge(result.percentage);
    store.setCharging(result.state !== "discharging");
  };

  const initialize = async () => {
    await fetchCharge();

    store._setInitialized(true);
  };

  useEffect(() => {
    initialize();
  }, []);

  return {
    _initialized: store._initialized,

    charge: store.charge,
    charging: store.charging,
  };
}
