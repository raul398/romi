import asyncio
import uuid
from datetime import datetime, timezone

from celery import Celery

from app.config import settings

celery_app = Celery(
    "romi",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def run_generation(self, job_id: str, gen_type: str, params: dict) -> dict:
    """Celery task that runs async provider generation in a sync wrapper."""
    return asyncio.run(_generate_async(job_id, gen_type, params))


async def _generate_async(job_id: str, gen_type: str, params: dict) -> dict:
    from app.database import connect_db, close_db, get_db
    from app.models.job import update_job

    await connect_db()
    try:
        # Resolve provider
        model = params.get("model", "kling")
        if model == "kling":
            from app.providers.kling import KlingProvider
            provider = KlingProvider()
        elif model == "happyhorse":
            from app.providers.happyhorse import HappyHorseProvider
            provider = HappyHorseProvider()
        elif model == "seedance":
            from app.providers.seedance import SeedanceProvider
            provider = SeedanceProvider()
        else:
            raise ValueError(f"Unknown provider: {model}")

        # Mark processing
        await update_job(job_id, {"status": "processing", "progress": 10})

        # Submit to provider
        provider_params = {**params, "gen_type": gen_type}
        ref_id = await provider.generate(provider_params)
        await update_job(job_id, {"status": "processing", "progress": 30, "params": {**provider_params, "ref_id": ref_id}})

        # Poll until done
        max_polls = 120  # 10 minutes at 5s intervals
        for _ in range(max_polls):
            await asyncio.sleep(5)
            status = await provider.get_status(ref_id)

            if status["status"] == "completed":
                video_url = status.get("video_url")
                await update_job(job_id, {
                    "status": "completed",
                    "progress": 100,
                    "video_url": video_url,
                })
                return {"status": "completed", "video_url": video_url}

            if status["status"] == "failed":
                error = status.get("error", "Provider returned failure")
                await update_job(job_id, {"status": "failed", "error": error})
                return {"status": "failed", "error": error}

            # Update progress
            await update_job(job_id, {"progress": status.get("progress", 30 + 60 * (_ / max_polls))})

        # Timeout
        await update_job(job_id, {"status": "failed", "error": "Generation timed out"})
        return {"status": "failed", "error": "Timed out after 5 minutes"}

    except Exception as e:
        await update_job(job_id, {"status": "failed", "error": str(e)})
        return {"status": "failed", "error": str(e)}
    finally:
        await close_db()
