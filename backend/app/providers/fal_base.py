import os

import fal_client

from app.config import settings
from app.providers.base import BaseProvider


class FalAIProvider(BaseProvider):
    """Base provider for fal.ai models using the queue-based API.

    Subclasses must define MODEL_MAP mapping gen_type -> model_id.
    """

    MODEL_MAP: dict[str, str] = {}

    def __init__(self):
        # fal-client reads FAL_KEY from env
        self.api_key = settings.happyhorse_api_key
        os.environ["FAL_KEY"] = self.api_key

    def _model_id(self, gen_type: str) -> str:
        model = self.MODEL_MAP.get(gen_type)
        if not model:
            model = self.MODEL_MAP.get("txt2video")
        return model

    async def generate(self, params: dict) -> str:
        gen_type = params.get("gen_type", "txt2video")
        model = self._model_id(gen_type)
        payload = self._build_payload(gen_type, params)

        handler = await fal_client.submit_async(model, arguments=payload)
        return handler.request_id

    def _build_payload(self, gen_type: str, params: dict) -> dict:
        """Override in subclasses for model-specific payloads."""
        payload: dict = {
            "prompt": params["prompt"],
        }

        duration = params.get("duration", 5)
        if duration:
            payload["duration"] = str(duration)

        if gen_type == "img2video" and params.get("image_url"):
            payload["image_url"] = params["image_url"]

        return payload

    async def get_status(self, ref_id: str) -> dict:
        """Try all model paths to find the status."""
        for model in self.MODEL_MAP.values():
            try:
                status = await fal_client.status_async(model, ref_id)
                return _map_status(status)
            except Exception:
                continue

        return {"status": "failed", "progress": 0, "video_url": None, "error": "Request not found"}

    async def get_result(self, ref_id: str) -> str | None:
        status = await self.get_status(ref_id)
        return status.get("video_url")


def _map_status(s) -> dict:
    """Map fal-client status response to our standard format.

    fal-client 1.0 returns InProgress (still queued/processing) or
    a completed result with .status / .result attributes.
    """
    # InProgress — still in the queue or processing
    if hasattr(s, "logs") and not hasattr(s, "status"):
        return {
            "status": "pending",
            "progress": 0,
            "video_url": None,
            "error": None,
        }

    # Has a status attribute — completed or failed
    raw_status = getattr(s, "status", None)

    status_map = {
        fal_client.Status.PENDING: "pending",
        fal_client.Status.IN_QUEUE: "pending",
        fal_client.Status.IN_PROGRESS: "processing",
        fal_client.Status.COMPLETED: "completed",
        fal_client.Status.FAILED: "failed",
    }

    progress = 0
    if raw_status == fal_client.Status.COMPLETED:
        progress = 100
    elif raw_status == fal_client.Status.IN_PROGRESS:
        progress = 50

    video_url = None
    error = None

    result = getattr(s, "result", None)
    if result:
        if isinstance(result, dict):
            video = result.get("video", {})
            if isinstance(video, dict):
                video_url = video.get("url")
            error = result.get("error")
        elif hasattr(result, "video"):
            video = result.video
            if isinstance(video, dict):
                video_url = video.get("url")
            elif hasattr(video, "url"):
                video_url = video.url
            error = getattr(result, "error", None)

    return {
        "status": status_map.get(raw_status, "pending"),
        "progress": progress,
        "video_url": video_url,
        "error": error,
    }
