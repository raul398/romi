from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field


class ModelProvider(StrEnum):
    kling = "kling"
    happyhorse = "happyhorse"
    seedance = "seedance"


class GenerationType(StrEnum):
    txt2video = "txt2video"
    img2video = "img2video"
    edit = "edit"


class JobStatus(StrEnum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


# ── Requests ──────────────────────────────────────────────────────────


class GenerateRequest(BaseModel):
    prompt: str
    model: ModelProvider
    gen_type: GenerationType = GenerationType.txt2video
    image_url: str | None = None
    duration: int | None = None  # seconds
    resolution: str | None = None


class EditRequest(BaseModel):
    video_url: str
    edit_type: Literal["extend", "transition", "style"]
    model: ModelProvider
    prompt: str | None = None
    params: dict = Field(default_factory=dict)


# ── Responses ─────────────────────────────────────────────────────────


class JobResponse(BaseModel):
    job_id: str
    status: JobStatus
    progress: int = 0
    video_url: str | None = None
    error: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    type: str | None = None
    prompt: str | None = None
    model: str | None = None
    duration: int | None = None


class JobListResponse(BaseModel):
    jobs: list[JobResponse]
