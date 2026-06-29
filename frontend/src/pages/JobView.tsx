import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Film,
  Image,
  Scissors,
} from "lucide-react";
import { getJob } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { JobResponse } from "@/types";

const modelLabels: Record<string, string> = {
  kling: "Kling 3.0",
  happyhorse: "HappyHorse 1.0",
  seedance: "Seedance 2.0",
};

const typeIcon = {
  txt2video: Film,
  img2video: Image,
  edit: Scissors,
};

const typeLabel: Record<string, string> = {
  txt2video: "Text to Video",
  img2video: "Image to Video",
  edit: "Edit",
};

export default function JobView() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;

    async function fetch() {
      try {
        const data = await getJob(jobId!);
        if (!cancelled) setJob(data);
      } catch (err) {
        if (!cancelled) setError("Job not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    const interval = setInterval(fetch, 5_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <p className="text-sm">{error ?? "Job not found"}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 text-sm text-violet-400 hover:text-violet-300 underline underline-offset-2"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const TypeIcon = typeIcon[job.type as keyof typeof typeIcon] ?? Film;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </button>

      {/* Video player */}
      <div className="rounded-xl overflow-hidden bg-black border border-zinc-800 aspect-video mb-6">
        {job.status === "completed" && job.video_url ? (
          <video
            src={job.video_url}
            className="w-full h-full object-contain"
            controls
            autoPlay
          />
        ) : job.status === "processing" || job.status === "pending" ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-500">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-sm">Generating video...</p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-600">
            <XCircle className="w-10 h-10 text-red-400/60" />
            <p className="text-sm text-zinc-500">
              {job.status === "failed" ? "Generation failed" : "No video"}
            </p>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-4">
        {/* Prompt */}
        <div>
          <h1 className="text-lg font-semibold leading-snug">
            {job.prompt ?? "Untitled"}
          </h1>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Status */}
          <div className="rounded-lg bg-zinc-900/50 border border-zinc-800 p-3">
            <p className="text-xs text-zinc-500 mb-1">Status</p>
            <span
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                job.status === "completed" && "text-green-400",
                job.status === "processing" && "text-blue-400",
                job.status === "pending" && "text-yellow-400",
                job.status === "failed" && "text-red-400"
              )}
            >
              {job.status === "completed" && <CheckCircle className="w-4 h-4" />}
              {job.status === "processing" && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {job.status === "pending" && <Clock className="w-4 h-4" />}
              {job.status === "failed" && <XCircle className="w-4 h-4" />}
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
          </div>

          {/* Model */}
          <div className="rounded-lg bg-zinc-900/50 border border-zinc-800 p-3">
            <p className="text-xs text-zinc-500 mb-1">Model</p>
            <p className="flex items-center gap-1.5">
              <TypeIcon className="w-4 h-4 text-zinc-400" />
              {modelLabels[job.model ?? ""] ?? job.model ?? "—"}
            </p>
          </div>

          {/* Type */}
          <div className="rounded-lg bg-zinc-900/50 border border-zinc-800 p-3">
            <p className="text-xs text-zinc-500 mb-1">Type</p>
            <p className="flex items-center gap-1.5">
              <TypeIcon className="w-4 h-4 text-zinc-400" />
              {typeLabel[job.type ?? ""] ?? job.type ?? "—"}
            </p>
          </div>

          {/* Duration */}
          <div className="rounded-lg bg-zinc-900/50 border border-zinc-800 p-3">
            <p className="text-xs text-zinc-500 mb-1">Duration</p>
            <p className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-zinc-400" />
              {job.duration ? `${job.duration}s` : "—"}
            </p>
          </div>

          {/* Created */}
          <div className="rounded-lg bg-zinc-900/50 border border-zinc-800 p-3">
            <p className="text-xs text-zinc-500 mb-1">Created</p>
            <p>
              {job.created_at
                ? new Date(job.created_at).toLocaleString()
                : "—"}
            </p>
          </div>

          {/* Error */}
          {job.status === "failed" && job.error && (
            <div className="rounded-lg bg-red-950/30 border border-red-900/50 p-3 col-span-2">
              <p className="text-xs text-zinc-500 mb-1">Error</p>
              <p className="text-xs text-red-400 break-word">{job.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
