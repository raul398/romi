export type ModelProvider = "kling" | "happyhorse" | "seedance";
export type GenerationType = "txt2video" | "img2video" | "edit";
export type EditType = "extend" | "transition" | "style";
export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface GenerateRequest {
  prompt: string;
  model: ModelProvider;
  gen_type: GenerationType;
  image_url?: string;
  duration?: number;
  resolution?: string;
}

export interface EditRequest {
  video_url: string;
  edit_type: EditType;
  model: ModelProvider;
  prompt?: string;
  params?: Record<string, unknown>;
}

export interface JobResponse {
  job_id: string;
  status: JobStatus;
  progress: number;
  video_url: string | null;
  error: string | null;
  created_at?: string;
  updated_at?: string;
  type?: string;
  prompt?: string;
  model?: string;
  duration?: number;
}

export interface WsMessage {
  job_id: string;
  status: JobStatus;
  progress: number;
  video_url: string | null;
  error: string | null;
}

export interface JobListResponse {
  jobs: JobResponse[];
}

export type TabId = "dashboard" | "txt2video" | "img2video" | "edit";
