from fastapi import APIRouter, HTTPException

from app.models.job import get_job, job_to_response, list_jobs
from app.models.schemas import JobListResponse, JobResponse

router = APIRouter(tags=["jobs"])


@router.get("/api/v1/jobs", response_model=JobListResponse)
async def list_all_jobs(limit: int = 20, skip: int = 0):
    """List recent generation jobs."""
    jobs = await list_jobs(limit=limit, skip=skip)
    return JobListResponse(jobs=[job_to_response(j) for j in jobs])


@router.get("/api/v1/jobs/{job_id}", response_model=JobResponse)
async def get_job_status(job_id: str):
    """Get the status and result of a specific job."""
    job = await get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job_to_response(job)
