from app.providers.fal_base import FalAIProvider


class SeedanceProvider(FalAIProvider):
    MODEL_MAP = {
        "txt2video": "bytedance/seedance-2.0/text-to-video",
        "img2video": "bytedance/seedance-2.0/image-to-video",
    }

    def _build_payload(self, gen_type: str, params: dict) -> dict:
        payload: dict = {
            "prompt": params["prompt"],
        }

        if gen_type == "img2video" and params.get("image_url"):
            payload["image_url"] = params["image_url"]

        if params.get("end_image_url"):
            payload["end_image_url"] = params["end_image_url"]

        # Duration: Seedance accepts "auto" or int 4-15
        duration = params.get("duration")
        if duration is not None:
            payload["duration"] = str(duration)

        if params.get("resolution"):
            payload["resolution"] = params["resolution"]

        if params.get("aspect_ratio"):
            payload["aspect_ratio"] = params["aspect_ratio"]

        # Default to generating audio (free, included)
        payload["generate_audio"] = params.get("generate_audio", True)

        return payload
