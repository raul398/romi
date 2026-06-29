import { useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle, XCircle, Wifi, WifiOff } from "lucide-react";
import { connectJobWs } from "@/lib/ws";
import { cn } from "@/lib/utils";
import type { JobResponse, WsMessage } from "@/types";

interface JobStatusProps {
  job: JobResponse;
}

export default function JobStatus({ job }: JobStatusProps) {
  const [state, setState] = useState<JobResponse>(job);
  const [connected, setConnected] = useState(false);
  const cleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    setState(job);

    cleanup.current = connectJobWs(
      job.job_id,
      (msg: WsMessage) => {
        setState((prev) => ({ ...prev, ...msg }));
      },
      setConnected
    );

    return () => cleanup.current?.();
  }, [job.job_id]);

  const statusConfig = {
    pending: { icon: Loader2, color: "text-zinc-400", label: "Pending" },
    processing: {
      icon: Loader2,
      color: "text-violet-400",
      label: `Processing ${state.progress}%`,
    },
    completed: { icon: CheckCircle, color: "text-emerald-400", label: "Completed" },
    failed: { icon: XCircle, color: "text-red-400", label: "Failed" },
  };

  const cfg = statusConfig[state.status];

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all",
        state.status === "completed" && "border-emerald-800 bg-emerald-950/20",
        state.status === "failed" && "border-red-800 bg-red-950/20",
        state.status === "processing" && "border-violet-800 bg-violet-950/20",
        state.status === "pending" && "border-zinc-700 bg-zinc-900"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <cfg.icon
            className={cn(
              "w-5 h-5",
              cfg.color,
              state.status === "processing" || state.status === "pending"
                ? "animate-spin"
                : ""
            )}
          />
          <div>
            <p className="text-sm font-medium text-zinc-200">{cfg.label}</p>
            <p className="text-xs text-zinc-500 font-mono">{state.job_id}</p>
          </div>
        </div>

        {connected ? (
          <Wifi className="w-4 h-4 text-emerald-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-zinc-600" />
        )}
      </div>

      {/* Progress bar */}
      {(state.status === "pending" || state.status === "processing") && (
        <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${state.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
