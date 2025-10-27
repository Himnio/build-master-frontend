import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle2, Clock, Smartphone } from "lucide-react";

interface Build {
  id: string;
  device: string;
  version: string;
  status: "success" | "building" | "pending";
  timestamp: Date;
}

interface BuildMonitorProps {
  builds: Build[];
}

export const BuildMonitor = ({ builds }: BuildMonitorProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "building":
        return <Activity className="h-4 w-4 text-primary animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-success/20 text-success hover:bg-success/30">Success</Badge>;
      case "building":
        return <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Building</Badge>;
      default:
        return <Badge className="bg-warning/20 text-warning hover:bg-warning/30">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Build Monitor</h2>
        <Badge variant="secondary" className="ml-auto">
          {builds.length} Total
        </Badge>
      </div>

      {builds.length === 0 ? (
        <Card className="bg-card border-border p-8 text-center">
          <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No builds yet. Install your first build to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {builds.map((build) => (
            <Card key={build.id} className="bg-card border-border p-4 hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(build.status)}
                  <span className="font-semibold">{build.device}</span>
                </div>
                {getStatusBadge(build.status)}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="font-mono text-primary">{build.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span>{build.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
