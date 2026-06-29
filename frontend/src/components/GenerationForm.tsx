import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModelProvider, GenerationType } from "@/types";

interface GenerationFormProps {
  genType: GenerationType;
  onSubmit: (params: {
    prompt: string;
    model: ModelProvider;
    imageUrl?: string;
    duration?: number;
  }) => Promise<void>;
  loading?: boolean;
  showImageUrl?: boolean;
  imageUrlPlaceholder?: string;
}

export default function GenerationForm({
  genType,
  onSubmit,
  loading = false,
  showImageUrl = false,
  imageUrlPlaceholder = "https://...",
}: GenerationFormProps) {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelProvider>("kling");
  const [imageUrl, setImageUrl] = useState("");
  const [duration, setDuration] = useState<number>(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await onSubmit({
      prompt: prompt.trim(),
      model,
      imageUrl: showImageUrl ? imageUrl || undefined : undefined,
      duration,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Prompt */}
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1.5">
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            genType === "txt2video"
              ? "A cinematic drone shot over a neon-lit city at night..."
              : "Animate this image with smooth motion..."
          }
          rows={3}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm 
                     placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 
                     focus:border-transparent resize-none"
        />
      </div>

      {/* Image URL (conditional) */}
      {showImageUrl && (
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">
            Image URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder={imageUrlPlaceholder}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm 
                       placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 
                       focus:border-transparent"
          />
        </div>
      )}

      {/* Options row */}
      <div className="grid grid-cols-2 gap-4">
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

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">
            Duration (s)
          </label>
          <input
            type="number"
            min={2}
            max={15}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm
                       focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !prompt.trim()}
        className={cn(
          "w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all",
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
  );
}
