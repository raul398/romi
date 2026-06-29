import { useState } from "react";
import GenerationForm from "@/components/GenerationForm";
import VideoPreview from "@/components/VideoPreview";
import JobStatus from "@/components/JobStatus";
import { generateVideo } from "@/lib/api";
import { useJobsStore } from "@/stores/jobs";
import type { JobResponse, ModelProvider } from "@/types";

export default function Img2Video() {
  const [currentJob, setCurrentJob] = useState<JobResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setActiveJob = useJobsStore((s) => s.setActiveJob);

  const handleSubmit = async (params: {
    prompt: string;
    model: ModelProvider;
    imageUrl?: string;
    duration?: number;
  }) => {
    if (!params.imageUrl) {
      setError("Image URL is required for Image to Video");
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentJob(null);

    try {
      const job = await generateVideo({
        prompt: params.prompt,
        model: params.model,
        gen_type: "img2video",
        image_url: params.imageUrl,
        duration: params.duration,
      });
      setCurrentJob(job);
      setActiveJob(job);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit generation");
    } finally {
      setLoading(false);
    }
  };

  const videoUrl =
    currentJob?.status === "completed" ? currentJob.video_url : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Image to Video</h2>
        <GenerationForm
          genType="img2video"
          onSubmit={handleSubmit}
          loading={loading}
          showImageUrl
          imageUrlPlaceholder="https://example.com/my-image.jpg"
        />

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
        <h2 className="text-lg font-semibold mb-4">Preview</h2>
        <VideoPreview
          url={videoUrl}
          loading={loading}
          error={currentJob?.status === "failed" ? currentJob.error : null}
        />
      </div>
    </div>
  );
}
