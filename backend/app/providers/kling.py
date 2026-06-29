import hashlib
import hmac
import json
import time
import uuid

import httpx

from app.config import settings
from app.providers.base import BaseProvider

_BASE_URL = "https://api.klingai.com"


class KlingProvider(BaseProvider):
    def __init__(self):
        self.access_key = settings.kling_access_key
        self.secret_key = settings.kling_secret_key
        self._client = httpx.AsyncClient(base_url=_BASE_URL)

    def _sign(self, method: str, path: str, body: str = "") -> dict:
        """Kling API v1 signature."""
        timestamp = int(time.time())
        nonce = uuid.uuid4().hex[:16]

        raw = f"{method}\n{path}\n{timestamp}\n{nonce}\n{body}\n"
        signature = hmac.new(
            self.secret_key.encode(), raw.encode(), hashlib.sha256
        ).hexdigest()

        return {
            "Content-Type": "application/json",
            "AK": self.access_key,
            "Timestamp": str(timestamp),
            "Nonce": nonce,
            "Signature": signature,
        }

    async def generate(self, params: dict) -> str:
        gen_type = params.get("gen_type", "txt2video")
        prompt = params["prompt"]

        payload = {
            "model_name": "kling-v1.6",
            "prompt": prompt,
            "duration": params.get("duration", 5),
            "mode": "pro",
        }

        if gen_type == "img2video" and params.get("image_url"):
            payload["image"] = params["image_url"]
            payload["prompt"] = prompt or "animate this image"

        path = "/v1/videos/generate"
        body = json.dumps(payload)
        headers = self._sign("POST", path, body)

        resp = await self._client.post(path, headers=headers, content=body)
        resp.raise_for_status()
        data = resp.json()

        return data["data"]["task_id"]

    async def get_status(self, ref_id: str) -> dict:
        path = f"/v1/videos/{ref_id}"
        headers = self._sign("GET", path)

        resp = await self._client.get(path, headers=headers)
        resp.raise_for_status()
        data = resp.json()["data"]

        status_map = {
            "pending": "pending",
            "running": "processing",
            "succeed": "completed",
            "failed": "failed",
        }

        return {
            "status": status_map.get(data["task_status"], "pending"),
            "progress": data.get("progress", 0) if data["task_status"] == "running" else 0,
            "video_url": data.get("task_result", {}).get("video_url"),
            "error": data.get("error", {}).get("message") if data.get("error") else None,
        }

    async def get_result(self, ref_id: str) -> str | None:
        status = await self.get_status(ref_id)
        return status.get("video_url")
