import { create } from "zustand";

export interface IBatteryStore {
  _initialized: boolean;

  charge: number;
  charging: boolean;

  _setInitialized: (value: boolean) => void;

  setCharge: (value: number) => void;
  setCharging: (value: boolean) => void;
}

export const useBatteryStore = create<IBatteryStore>((set, get) => ({
  _initialized: false,

  charge: 0,
  charging: false,

  _setInitialized: (value: boolean) => set({ _initialized: value }),

  setCharge: (value: number) => set({ charge: value }),
  setCharging: (value: boolean) => set({ charging: value }),
}));
