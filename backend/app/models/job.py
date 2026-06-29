from datetime import datetime, timezone

from app.database import get_db


async def create_job(job_id: str, gen_type: str, params: dict) -> dict:
    db = get_db()
    doc = {
        "_id": job_id,
        "type": gen_type,
        "params": params,
        "status": "pending",
        "progress": 0,
        "video_url": None,
        "error": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    await db["jobs"].insert_one(doc)
    return doc


async def update_job(job_id: str, update: dict) -> dict | None:
    db = get_db()
    update["updated_at"] = datetime.now(timezone.utc)
    await db["jobs"].update_one({"_id": job_id}, {"$set": update})
    doc = await db["jobs"].find_one({"_id": job_id})
    return doc


async def get_job(job_id: str) -> dict | None:
    db = get_db()
    return await db["jobs"].find_one({"_id": job_id})


async def list_jobs(limit: int = 20, skip: int = 0) -> list[dict]:
    db = get_db()
    cursor = db["jobs"].find().sort("created_at", -1).skip(skip).limit(limit)
    return await cursor.to_list(length=limit)


def job_to_response(job: dict) -> dict:
    params = job.get("params", {})
    return {
        "job_id": job["_id"],
        "status": job["status"],
        "progress": job.get("progress", 0),
        "video_url": job.get("video_url"),
        "error": job.get("error"),
        "created_at": job.get("created_at"),
        "updated_at": job.get("updated_at"),
        "type": job.get("type"),
        "prompt": params.get("prompt"),
        "model": params.get("model"),
        "duration": params.get("duration"),
    }
