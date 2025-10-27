import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Terminal } from "lucide-react";

interface BuildLogsProps {
  logs: string[];
}

export const BuildLogs = ({ logs }: BuildLogsProps) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <Card className="bg-terminal-bg border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Build Logs</h2>
      </div>
      
      <div className="bg-background rounded-lg p-4 h-64 overflow-y-auto terminal-font text-sm">
        {logs.length === 0 ? (
          <div className="text-muted-foreground italic">
            No logs yet. Start an installation to see build logs...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="text-terminal-text py-0.5 font-mono">
              <span className="text-muted-foreground mr-2">[{new Date().toLocaleTimeString()}]</span>
              {log}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </Card>
  );
};
