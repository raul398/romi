import { create } from "zustand";
import type { JobResponse, WsMessage } from "@/types";

interface JobsStore {
  activeJobs: Map<string, JobResponse>;
  setActiveJob: (job: JobResponse) => void;
  updateFromWs: (msg: WsMessage) => void;
  removeJob: (jobId: string) => void;
}

export const useJobsStore = create<JobsStore>((set) => ({
  activeJobs: new Map(),

  setActiveJob: (job) =>
    set((state) => {
      const next = new Map(state.activeJobs);
      next.set(job.job_id, job);
      return { activeJobs: next };
    }),

  updateFromWs: (msg) =>
    set((state) => {
      const next = new Map(state.activeJobs);
      const existing = next.get(msg.job_id);
      if (existing) {
        next.set(msg.job_id, {
          ...existing,
          status: msg.status,
          progress: msg.progress,
          video_url: msg.video_url,
          error: msg.error,
        });
      }
      return { activeJobs: next };
    }),

  removeJob: (jobId) =>
    set((state) => {
      const next = new Map(state.activeJobs);
      next.delete(jobId);
      return { activeJobs: next };
    }),
}));
