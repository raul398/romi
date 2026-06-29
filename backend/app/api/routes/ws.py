import asyncio
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.database import get_db

router = APIRouter(tags=["websocket"])


@router.websocket("/api/v1/ws/{job_id}")
async def job_websocket(websocket: WebSocket, job_id: str):
    """WebSocket for real-time job progress updates."""
    await websocket.accept()

    try:
        db = get_db()

        # Send current state immediately
        job = await db["jobs"].find_one({"_id": job_id}) if db else None
        if job:
            await websocket.send_json({
                "job_id": job_id,
                "status": job["status"],
                "progress": job.get("progress", 0),
                "video_url": job.get("video_url"),
                "error": job.get("error"),
            })

        # Poll for changes
        last_progress = -1
        last_status = None
        for _ in range(120):  # 2 minutes max
            if db:
                job = await db["jobs"].find_one({"_id": job_id})
                if job:
                    progress = job.get("progress", 0)
                    status = job["status"]

                    if progress != last_progress or status != last_status:
                        last_progress = progress
                        last_status = status

                        await websocket.send_json({
                            "job_id": job_id,
                            "status": status,
                            "progress": progress,
                            "video_url": job.get("video_url"),
                            "error": job.get("error"),
                        })

                        if status in ("completed", "failed"):
                            break

            await asyncio.sleep(2)

    except WebSocketDisconnect:
        pass
    except Exception:
        try:
            await websocket.close(code=1011)
        except RuntimeError:
            pass
