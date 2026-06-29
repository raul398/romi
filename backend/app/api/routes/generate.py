import uuid

from fastapi import APIRouter, HTTPException

from app.models.job import create_job, job_to_response
from app.models.schemas import GenerateRequest, EditRequest, JobResponse
from app.worker.tasks import run_generation

router = APIRouter(tags=["generate"])


@router.post("/api/v1/generate", response_model=JobResponse, status_code=201)
async def generate_video(req: GenerateRequest):
    """Submit a new video generation job."""
    job_id = uuid.uuid4().hex[:12]

    params = {
        "model": req.model.value,
        "prompt": req.prompt,
        "duration": req.duration,
        "resolution": req.resolution,
    }
    if req.image_url:
        params["image_url"] = req.image_url

    await create_job(job_id, req.gen_type.value, params)

    # Dispatch to Celery in the background
    run_generation.delay(job_id, req.gen_type.value, params)

    return {
        "job_id": job_id,
        "status": "pending",
        "progress": 0,
    }


@router.post("/api/v1/edit", response_model=JobResponse, status_code=201)
async def edit_video(req: EditRequest):
    """Submit a video editing job."""
    job_id = uuid.uuid4().hex[:12]

    params = {
        "model": req.model.value,
        "edit_type": req.edit_type,
        "video_url": req.video_url,
        "prompt": req.prompt,
        **req.params,
    }

    await create_job(job_id, "edit", params)
    run_generation.delay(job_id, "edit", params)

    return {
        "job_id": job_id,
        "status": "pending",
        "progress": 0,
    }
