import { Film } from "lucide-react";

interface VideoPreviewProps {
  url: string | null;
  loading?: boolean;
  error?: string | null;
}

export default function VideoPreview({ url, loading, error }: VideoPreviewProps) {
  if (error) {
    return (
      <div className="rounded-lg bg-red-950/50 border border-red-800 p-6 text-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-6 flex flex-col items-center justify-center gap-3 aspect-video">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Generating...</p>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-6 flex flex-col items-center justify-center gap-3 aspect-video">
        <Film className="w-10 h-10 text-zinc-700" />
        <p className="text-zinc-600 text-sm">Your video will appear here</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden bg-black border border-zinc-800">
      <video
        src={url}
        controls
        autoPlay
        className="w-full aspect-video"
        playsInline
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
