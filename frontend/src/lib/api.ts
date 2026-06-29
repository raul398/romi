import type {
  GenerateRequest,
  EditRequest,
  JobResponse,
  JobListResponse,
} from "@/types";

const BASE = "/api/v1";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

export async function generateVideo(
  req: GenerateRequest
): Promise<JobResponse> {
  return request("/generate", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function editVideo(req: EditRequest): Promise<JobResponse> {
  return request("/edit", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function getJob(jobId: string): Promise<JobResponse> {
  return request(`/jobs/${jobId}`);
}

export async function listJobs(
  limit = 20,
  skip = 0
): Promise<JobListResponse> {
  return request(`/jobs?limit=${limit}&skip=${skip}`);
}

export async function healthCheck(): Promise<{ status: string }> {
  return request("/health");
}
