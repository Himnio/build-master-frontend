import { useState } from "react";
import { InstallForm } from "@/components/InstallForm";
import { BuildLogs } from "@/components/BuildLogs";
import { BuildMonitor } from "@/components/BuildMonitor";
import { toast } from "sonner";
import logo from "../assets/nbcu.png";

interface Build {
  id: string;
  device: string;
  version: string;
  status: "success" | "building" | "pending";
  timestamp: Date;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);

  const simulateBuildProcess = (device: string, version: string) => {
    const buildId = `build-${Date.now()}`;
    const newBuild: Build = {
      id: buildId,
      device,
      version,
      status: "building",
      timestamp: new Date(),
    };

    setBuilds((prev) => [newBuild, ...prev]);

    const buildSteps = [
      `Initializing build for ${device} v${version}...`,
      `Fetching dependencies...`,
      `Compiling source code...`,
      `Running platform-specific optimizations...`,
      `Packaging application...`,
      `Generating build artifacts...`,
      `Running quality checks...`,
      `Build completed successfully! 🎉`,
    ];

    buildSteps.forEach((step, index) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, step]);
        
        if (index === buildSteps.length - 1) {
          setBuilds((prev) =>
            prev.map((b) =>
              b.id === buildId ? { ...b, status: "success" } : b
            )
          );
          setIsLoading(false);
          toast.success("Build installed successfully!");
        }
      }, (index + 1) * 800);
    });
  };

  const handleInstall = (device: string, version: string) => {
    setIsLoading(true);
    setLogs([]);
    toast.info(`Starting installation for ${device}...`);
    simulateBuildProcess(device, version);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="BuildDeploy Logo" className="h-20 w-200" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Build Master
          </h1>
          <p className="text-muted-foreground">
            Deploy your builds across multiple devices with ease
          </p>
        </div>

        {/* Install Form */}
        <div className="mb-8">
          <InstallForm onInstall={handleInstall} isLoading={isLoading} />
        </div>

        {/* Build Logs */}
        <div className="mb-8">
          <BuildLogs logs={logs} />
        </div>

        {/* Build Monitor */}
        <BuildMonitor builds={builds} />
      </div>
    </div>
  );
};

export default Index;
