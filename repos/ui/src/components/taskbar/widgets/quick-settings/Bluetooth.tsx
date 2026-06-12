import { API } from "@/classes/API";
import { TBIcon } from "@/components/base/taskbar/TBIcon";
import { useCallback, useEffect, useState } from "react";
import {
  MdBluetooth,
  MdBluetoothConnected,
  MdBluetoothDisabled,
} from "react-icons/md";

const iconConfig = {
  powerOff: MdBluetoothDisabled,
  powerOn: MdBluetooth,
  connected: MdBluetoothConnected,
};

export function TBQSWBluetooth() {
  const [powered, setPowered] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);

  const fetchDetails = useCallback(async () => {
    const result = await API.get<{
      powered: boolean;
      connected: boolean;
    }>("/v1/network/bluetooth/details");

    if (!result || "error" in result) {
      setPowered(false);
      setConnected(false);

      return;
    }

    setPowered(result.powered);
    setConnected(result.connected);
  }, []);

  useEffect(() => {
    fetchDetails();

    const i = setInterval(() => {
      fetchDetails();
    }, 5000);

    return () => clearInterval(i);
  }, [fetchDetails]);

  const icon =
    powered && connected ? "connected" : powered ? "powerOn" : "powerOff";

  return <TBIcon icon={iconConfig[icon]} />;
}
