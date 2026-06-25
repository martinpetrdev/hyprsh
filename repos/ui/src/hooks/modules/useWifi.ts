import { useCallback, useEffect } from "react";
import { useWifiStore, IWifiNetwork } from "../stores/useWifiStore";
import { API } from "@/classes/API";
import { useEvent } from "./useEvents";

export function useWifiModule() {
  const store = useWifiStore();
  useEvent("wifi.power", async (value: boolean) => {
    store.setPowered(value);

    if (!value) {
      store.setConnected(false);
      store.setSsid(null);
      store.setStrength(null);
      store.setNetworks([]);
    } else {
      await fetchConnection();
      await fetchNetworks(true);
    }
  });
  useEvent("wifi.ssid", (ssid: string | null) => {
    store.setSsid(ssid);

    if (!ssid) {
      store.setConnected(false);
      store.setStrength(null);
    } else store.setConnected(true);
  });
  useEvent("wifi.strength", (strength: number | null) => {
    store.setStrength(strength);
  });
  useEvent("wifi.networks", (networks: IWifiNetwork[]) => {
    store.setNetworks(networks);
  });

  const fetchStatus = async () => {
    const result = await API.get<{
      powered: boolean;
    }>("/v1/network/wifi/status");

    if ("error" in result) return;

    store.setPowered(result.powered);
  };

  const fetchConnection = async () => {
    const result = await API.get<{
      ssid: string;
      strength: number;
    } | null>("/v1/network/wifi/details");

    if (!result || "error" in result) {
      store.setConnected(false);
      store.setSsid(null);
      store.setStrength(null);
    } else {
      store.setConnected(true);
      store.setSsid(result.ssid);
      store.setStrength(result.strength);
    }
  };

  const fetchNetworks = useCallback(async (rescan = false) => {
    const result = await API.get<IWifiNetwork[]>(
      `/v1/network/wifi/list${rescan ? "?rescan=true" : ""}`,
    );

    if ("error" in result) {
      store.setNetworks([]);
      return;
    }

    store.setNetworks(result);
  }, []);

  const initialize = async () => {
    await fetchStatus();
    await fetchConnection();

    if (store.powered) {
      await fetchNetworks(false);
    } else {
      store.setNetworks([]);
    }

    store._setInitialized(true);
  };

  const togglePower = useCallback(async (enabled: boolean) => {
    await API.post<void, { enabled: boolean }>("/v1/network/wifi/power", {
      enabled,
    });
  }, []);

  const connect = useCallback(async (ssid: string) => {
    store.setConnectingSsid(ssid);

    try {
      await API.post<void, { ssid: string }>("/v1/network/wifi/connect", {
        ssid,
      });
    } finally {
      store.setConnectingSsid(null);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, []);

  return {
    _initialized: store._initialized,

    powered: store.powered,
    connected: store.connected,
    ssid: store.ssid,
    strength: store.strength,
    networks: store.networks,
    connectingSsid: store.connectingSsid,
    fetchNetworks,
    togglePower,
    connect,
  };
}
