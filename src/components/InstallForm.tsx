import { useState , useEffect} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
}

const envs = [
  {value: "production", label: "Prod"},
  { value: "stableint", label: "Stable Int" },
  { value: "Proton", label: "Proton" },
]

const propositions = [
  { value: "ShowMax", label: "ShowMax" },
  { value: "Peacock", label: "Peacock" },
  { value: "Now", label: "Now" },
  { value: "SkyShowTime", label: "SkyShowTime" },
];

export const InstallForm = ({ onInstall, isLoading }: InstallFormProps) => {
  const [devices, setDevices] = useState<Devices[]>([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [version, setVersion] = useState<Record<string, string>>({});
  const [selectedVersion, setSelectedVersion] = useState("");
  const [selectedEnv, setSelectedEnv] = useState("");
  const [selectedProp, setSelectedProp] = useState("");

  //Fetch the real devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/devices')
        if(!res.ok) throw new Error("Failed to fetch devices")
        const data = await res.json();
        if (data.devices && data.success){
          setDevices(data.devices)
        }else {
          throw new Error("No devices found")
        }
      }catch(error){
         console.warn("⚠️ API unavailable — using mock device list", error);
        // Mock fallback
        setDevices([
          { name: "ANDROID_MOBILE", ip: "", mac: "", type: "wireless" },
          { name: "ANDROID_TV", ip: "", mac: "", type: "wireless" },
          { name: "ROKU_EXPRESS_4K", ip: "", mac: "", type: "wireless" },
          { name: "IPHONE", ip: "", mac: "", type: "wireless" },
        ]);
      }
    };
    fetchDevices();
  }, []);



  //Load build.json  
  useEffect(()=> {
    fetch('/data/build.json')
    .then((res)=> res.json()) 
    .then((data)=> setVersion(data))
    .catch((err)=> console.log("Error loading build.json file", err));
  }, [])


  const handleInstall = () => {
    if (selectedDevice && selectedVersion) {
      const buildPath = version[selectedVersion]
      onInstall(selectedDevice, selectedVersion, buildPath);
    }
  };


  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
        <label className="text-sm font-medium mb-2 block text-muted-foreground">
          Device Platform
        </label>
        <Select value={selectedDevice} onValueChange={setSelectedDevice}>
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
      
      <div className="flex-1 w-full">
        <label className="text-sm font-medium mb-2 block text-muted-foreground">
          Enviroment
        </label>
        <Select value={selectedEnv} onValueChange={setSelectedEnv}>
          <SelectTrigger className="w-full bg-secondary border-border">
            <SelectValue placeholder="Select enviroment..." />
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


      <div className="flex-1 w-full">
        <label className="text-sm font-medium mb-2 block text-muted-foreground">
          Propostion
        </label>
        <Select value={selectedProp} onValueChange={setSelectedProp}>
          <SelectTrigger className="w-full bg-secondary border-border">
            <SelectValue placeholder="Select Propostion..." />
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

  <div className="flex-1 w-full">
        <label className="text-sm font-medium mb-2 block text-muted-foreground">
          Version
        </label>
        <Select value={selectedVersion} onValueChange={setSelectedVersion}>
          <SelectTrigger className="w-full bg-secondary border-border">
            <SelectValue placeholder="Select version..." />
          </SelectTrigger>
          <SelectContent className="bg-secondary border-border z-50 max-h-60 overflow-y-auto">
            {Object.keys(version).length === 0 ? (
              <SelectItem disabled value="loading">Loading...</SelectItem>
            ) : (
              Object.entries(version).map(([version, path]) => (
                <SelectItem key={version} value={version}>
                  {version} — <span className="text-xs text-muted-foreground">{path}</span>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Install Button */}
      <Button
        onClick={handleInstall}
        disabled={!selectedDevice || !selectedVersion || isLoading}
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Installing...
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
