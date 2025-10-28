import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Rocket } from "lucide-react";

interface Devices {
  name: string;
  ip: string;
  mac: string;
  type: string;
}

interface InstallFormProps {
  onInstall: (device: string, version: string, buildPath: string) => void;
  isLoading: boolean;
  onLogUpdate: (log: string) => void;
}

const envs = [
  { value: "production", label: "Prod" },
  { value: "stableint", label: "Stable Int" },
  { value: "Proton", label: "Proton" },
];

const propositions = [
  { value: "ShowMax", label: "ShowMax" },
  { value: "Peacock", label: "Peacock" },
  { value: "Now", label: "Now" },
  { value: "SkyShowTime", label: "SkyShowTime" },
];

export const InstallForm = ({ onInstall, isLoading, onLogUpdate }: InstallFormProps) => {
  const [devices, setDevices] = useState<Devices[]>([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [version, setVersion] = useState<Record<string, string>>({});
  const [selectedVersion, setSelectedVersion] = useState("");
  const [selectedEnv, setSelectedEnv] = useState("");
  const [selectedProp, setSelectedProp] = useState("");
  const [loadingInstall, setLoadingInstall] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/devices");
        if (!res.ok) throw new Error("Failed to fetch devices");
        const data = await res.json();
        onLogUpdate("✅ Devices are getting fetched from the network...");
        onLogUpdate("On process .....")
        
        if (data.devices && data.success) {
          setDevices(data.devices);
        onLogUpdate("✅ Devices found on the network:..");
        } else {
          throw new Error("No devices found");
        }
      } catch (error) {
        console.warn("⚠️ API unavailable — using mock device list", error);
        onLogUpdate("⚠️ No devices found on the network");
        setDevices([
          { name: "ANDROID_MOBILE", ip: "192.168.0.10", mac: "", type: "wireless" },
          { name: "ANDROID_TV", ip: "192.168.0.20", mac: "", type: "wireless" },
          { name: "ROKU_EXPRESS_4K", ip: "192.168.0.30", mac: "", type: "wireless" },
          { name: "IPHONE", ip: "192.168.0.40", mac: "", type: "wireless" },
        ]);
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    fetch("/data/build.json")
      .then((res) => res.json())
      .then((data) => setVersion(data))
      .catch((err) => console.log("Error loading build.json file", err));
  }, []);

  const handleDeviceSelect = async (deviceName: string) => {
    setSelectedDevice(deviceName);

    const device = devices.find((d) => d.name === deviceName);
    if (!device || !device.ip) {
      onLogUpdate(`⚠️ No IP found for device ${deviceName}`);
      return;
    }

    onLogUpdate(`🔄 Connecting to ${deviceName} (${device.ip})...`);

    try {
      const response = await fetch("http://localhost:8000/api/adb/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_ip: device.ip,
          port: 5555,
        }),
      });

      if (response.ok) {
        onLogUpdate(`✅ Connected successfully to ${deviceName}`);
      } else {
        const errorText = await response.text();
        onLogUpdate(`❌ Failed to connect to ${deviceName}: ${errorText}`);
      }
    } catch (err: any) {
      onLogUpdate(`❌ Error connecting to ${deviceName}: ${err.message}`);
    }
  };

  const handleInstall = async () => {
    if (!selectedDevice || !selectedVersion) return;

    const device = devices.find((d) => d.name === selectedDevice);
    if (!device || !device.ip) {
      onLogUpdate(`⚠️ Cannot push build — device IP not found.`);
      return;
    }

    const buildPath = version[selectedVersion];
    if (!buildPath) {
      onLogUpdate(`⚠️ No build path found for version ${selectedVersion}`);
      return;
    }

    const localFilePath = `/Users/604577022/Downloads/${buildPath.split("/").pop()}`;

    onLogUpdate(`📦 Build push pending for ${device.name}...`);
    setLoadingInstall(true);

    try {
      onLogUpdate(`🚀 Uploading build (${selectedVersion}) to ${device.ip}...`);

      const response = await fetch("http://localhost:8000/api/adb/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_ip: device.ip,
          local_file_path: localFilePath,
        }),
      });

      if (response.ok) {
        onLogUpdate(`✅ Build push completed successfully for ${device.name}`);
        onInstall(selectedDevice, selectedVersion, buildPath);
      } else {
        const errorText = await response.text();
        onLogUpdate(`❌ Build push failed for ${device.name}: ${errorText}`);
      }
    } catch (err: any) {
      onLogUpdate(`❌ Error pushing build: ${err.message}`);
    } finally {
      setLoadingInstall(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end">
      {/* Device Selector */}
      <div className="flex-1 w-full">
        <label className="text-sm font-medium mb-2 block text-muted-foreground">Device Platform</label>
        <Select value={selectedDevice} onValueChange={handleDeviceSelect}>
          <SelectTrigger className="w-full bg-secondary border-border">
            <SelectValue placeholder="Select device..." />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-border z-50">
            {devices.length === 0 ? (
              <SelectItem disabled value="loading">
                Loading devices...
              </SelectItem>
            ) : (
              devices.map((device, i) => (
                <SelectItem key={i} value={device.name}>
                  {device.name} ({device.type})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Environment */}
      <div className="flex-1 w-full">
        <label className="text-sm font-medium mb-2 block text-muted-foreground">Environment</label>
        <Select value={selectedEnv} onValueChange={setSelectedEnv}>
          <SelectTrigger className="w-full bg-secondary border-border">
            <SelectValue placeholder="Select environment..." />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-border z-50">
            {envs.map((env) => (
              <SelectItem key={env.value} value={env.value}>
                {env.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Proposition */}
      <div className="flex-1 w-full">
        <label className="text-sm font-medium mb-2 block text-muted-foreground">Proposition</label>
        <Select value={selectedProp} onValueChange={setSelectedProp}>
          <SelectTrigger className="w-full bg-secondary border-border">
            <SelectValue placeholder="Select Proposition..." />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-border z-50">
            {propositions.map((propo) => (
              <SelectItem key={propo.value} value={propo.value}>
                {propo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Version */}
      <div className="flex-1 w-full">
        <label className="text-sm font-medium mb-2 block text-muted-foreground">Version</label>
        <Select value={selectedVersion} onValueChange={setSelectedVersion}>
          <SelectTrigger className="w-full bg-secondary border-border">
            <SelectValue placeholder="Select version..." />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-border z-50 max-h-60 overflow-y-auto">
            {Object.keys(version).length === 0 ? (
              <SelectItem disabled value="loading">
                Loading...
              </SelectItem>
            ) : (
              Object.entries(version).map(([ver, path]) => (
                <SelectItem key={ver} value={ver}>
                  {ver} — <span className="text-xs text-muted-foreground">{path}</span>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Install Button */}
      <Button
        onClick={handleInstall}
        disabled={!selectedDevice || !selectedVersion || isLoading || loadingInstall}
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
        size="lg"
      >
        {loadingInstall ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Pushing build...
          </>
        ) : (
          <>
            <Rocket className="mr-2 h-4 w-4" />
            Install
          </>
        )}
      </Button>
    </div>
  );
};
