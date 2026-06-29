import { useState } from "react";
import { Scissors, Loader2, Send } from "lucide-react";
import VideoPreview from "@/components/VideoPreview";
import JobStatus from "@/components/JobStatus";
import { editVideo } from "@/lib/api";
import { useJobsStore } from "@/stores/jobs";
import { cn } from "@/lib/utils";
import type { JobResponse, EditType, ModelProvider } from "@/types";

const editTypes: { value: EditType; label: string; desc: string }[] = [
  { value: "extend", label: "Extend", desc: "Continue the video beyond its original length" },
  { value: "transition", label: "Transition", desc: "Create a smooth transition between clips" },
  { value: "style", label: "Style Transfer", desc: "Apply a new visual style to the video" },
];

export default function Edit() {
  const [currentJob, setCurrentJob] = useState<JobResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [editType, setEditType] = useState<EditType>("extend");
  const [model, setModel] = useState<ModelProvider>("kling");
  const setActiveJob = useJobsStore((s) => s.setActiveJob);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setError("Video URL is required");
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentJob(null);

    try {
      const job = await editVideo({
        video_url: videoUrl.trim(),
        edit_type: editType,
        model,
        prompt: prompt.trim() || undefined,
      });
      setCurrentJob(job);
      setActiveJob(job);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit edit");
    } finally {
      setLoading(false);
    }
  };

  const outputUrl =
    currentJob?.status === "completed" ? currentJob.video_url : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Video Editing</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Edit type selector */}
          <div className="grid grid-cols-3 gap-2">
            {editTypes.map((et) => (
              <button
                key={et.value}
                type="button"
                onClick={() => setEditType(et.value)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-all",
                  editType === et.value
                    ? "border-violet-500 bg-violet-950/30"
                    : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                )}
              >
                <p className="text-sm font-medium">{et.label}</p>
                <p className="text-xs text-zinc-500 mt-1">{et.desc}</p>
              </button>
            ))}
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Source Video URL
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/my-video.mp4"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm
                         placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Style Prompt (optional)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="In the style of a 1980s cyberpunk anime..."
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm
                         placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          {/* Model selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as ModelProvider)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="kling">Kling 3.0</option>
              <option value="happyhorse">HappyHorse 1.0</option>
              <option value="seedance">Seedance 2.0</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !videoUrl.trim()}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all",
              loading || !videoUrl.trim()
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-violet-600 text-white hover:bg-violet-500 active:scale-[0.98]"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Scissors className="w-4 h-4" />
                Edit Video
              </>
            )}
          </button>
        </form>

        {currentJob && (
          <div className="mt-4">
            <JobStatus job={currentJob} />
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-red-950/50 border border-red-800 p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Output</h2>
        <VideoPreview
          url={outputUrl}
          loading={loading}
          error={currentJob?.status === "failed" ? currentJob.error : null}
        />
      </div>
    </div>
  );
}
