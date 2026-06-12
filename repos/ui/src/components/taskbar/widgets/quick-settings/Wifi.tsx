import { API } from "@/classes/API";
import { TBIcon } from "@/components/base/taskbar/TBIcon";
import { useCallback, useEffect, useState } from "react";
import {
  MdSignalWifi0Bar,
  MdSignalWifi1Bar,
  MdSignalWifi2Bar,
  MdSignalWifi3Bar,
  MdSignalWifi4Bar,
  MdSignalWifiBad,
} from "react-icons/md";

const iconConfig = {
  disconnected: MdSignalWifiBad,
  0: MdSignalWifi0Bar,
  1: MdSignalWifi1Bar,
  2: MdSignalWifi2Bar,
  3: MdSignalWifi3Bar,
  4: MdSignalWifi4Bar,
};

export function TBQSWWifi() {
  const [connected, setConnected] = useState<boolean>(false);
  const [strength, setStrength] = useState<number>(0); // percentage
  const [ssid, setSsid] = useState<string>("Disconnected");

  const fetchDetails = useCallback(async () => {
    const result = await API.get<{
      ssid: string;
      strength: number;
    } | null>("/v1/network/wifi/details");

    if (!result || "error" in result) {
      setConnected(false);
      setStrength(0);
      setSsid("Disconnected");

      return;
    }

    setConnected(true);
    setStrength(result.strength);
    setSsid(result.ssid);
  }, []);

  useEffect(() => {
    fetchDetails();

    const i = setInterval(() => {
      fetchDetails();
    }, 5000);

    return () => clearInterval(i);
  }, [fetchDetails]);

  const bars =
    strength < 20
      ? 0
      : strength < 40
        ? 1
        : strength < 60
          ? 2
          : strength < 80
            ? 3
            : 4;

  return (
    <abbr title={ssid}>
      <TBIcon icon={connected ? iconConfig[bars] : iconConfig.disconnected} />
    </abbr>
  );
}
