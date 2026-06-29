import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Loader2,
  Send,
  X,
  Film,
  Image,
  Scissors,
} from "lucide-react";
import { listJobs, generateVideo } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { JobResponse, ModelProvider, GenerationType } from "@/types";

// ── Status helpers ──────────────────────────────────────────────────

type StatusStyle = "success" | "warning" | "danger" | "muted";

const statusStyle: Record<string, StatusStyle> = {
  completed: "success",
  pending: "warning",
  processing: "warning",
  failed: "danger",
};

const statusLabel: Record<string, string> = {
  completed: "Completed",
  pending: "Pending",
  processing: "Processing",
  failed: "Failed",
};

const statusDot: Record<StatusStyle, string> = {
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
  muted: "bg-zinc-500",
};

const modelLabels: Record<string, string> = {
  kling: "Kling 3.0",
  happyhorse: "HappyHorse 1.0",
  seedance: "Seedance 2.0",
};

// ── Modal ────────────────────────────────────────────────────────────

function NewVideoModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [genType, setGenType] = useState<GenerationType>("txt2video");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelProvider>("seedance");
  const [imageUrl, setImageUrl] = useState("");
  const [duration, setDuration] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (genType === "img2video" && !imageUrl.trim()) {
      setError("Image URL is required for Image to Video");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await generateVideo({
        prompt: prompt.trim(),
        model,
        gen_type: genType,
        image_url: imageUrl.trim() || undefined,
        duration,
      });
      onCreated();
      onClose();
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  function reset() {
    setPrompt("");
    setImageUrl("");
    setDuration(5);
    setError(null);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-lg font-semibold">New Video</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Gen type tabs */}
          <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
            {(
              [
                ["txt2video", "Text to Video", Film],
                ["img2video", "Image to Video", Image],
                ["edit", "Edit", Scissors],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setGenType(id as GenerationType)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-all",
                  genType === id
                    ? "bg-violet-600 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                genType === "txt2video"
                  ? "Describe the video you want to generate..."
                  : "Describe how you want the image to animate..."
              }
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm
                         placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500
                         focus:border-transparent resize-none"
            />
          </div>

          {/* Image URL (img2video only) */}
          {genType === "img2video" && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/my-image.jpg"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm
                           placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          )}

          {/* Options row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as ModelProvider)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="seedance">Seedance 2.0</option>
                <option value="happyhorse">HappyHorse 1.0</option>
                <option value="kling">Kling 3.0</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Duration (s)
              </label>
              <input
                type="number"
                min={2}
                max={15}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
              loading || !prompt.trim()
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-violet-600 text-white hover:bg-violet-500 active:scale-[0.98]"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const data = await listJobs(100);
      setJobs(data.jobs);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 10_000);
    return () => clearInterval(interval);
  }, [fetch]);

  // ── Empty state ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold">Videos</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {jobs.length} video{jobs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors active:scale-[0.97]"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Grid */}
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Film className="w-10 h-10 mb-3" />
          <p className="text-sm">No videos yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 text-sm text-violet-400 hover:text-violet-300 underline underline-offset-2"
          >
            Create your first video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {jobs.map((job) => {
            const sStyle = statusStyle[job.status] ?? "muted";

            return (
              <button
                key={job.job_id}
                onClick={() => navigate(`/job/${job.job_id}`)}
                className={cn(
                  "text-left w-full rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-600 hover:bg-zinc-900",
                  job.status === "completed"
                    ? "opacity-100"
                    : "opacity-55"
                )}
              >
                {/* Name (prompt) */}
                <p className="text-sm font-medium text-zinc-200 leading-snug line-clamp-2 mb-3 min-h-[2.5rem]">
                  {job.prompt ?? "Untitled"}
                </p>

                {/* Status + Duration row */}
                <div className="flex items-center justify-between">
                  {/* Status */}
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        statusDot[sStyle]
                      )}
                    />
                    <span className="text-xs text-zinc-400">
                      {statusLabel[job.status] ?? job.status}
                    </span>
                  </span>

                  {/* Duration */}
                  {job.duration && (
                    <span className="text-xs text-zinc-500">
                      {job.duration}s
                    </span>
                  )}
                </div>

                {/* Date */}
                <p className="text-[11px] text-zinc-600 mt-1.5">
                  {job.created_at
                    ? new Date(job.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* New video modal */}
      {showModal && (
        <NewVideoModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onCreated={fetch}
        />
      )}
    </div>
  );
}
