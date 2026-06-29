from app.providers.fal_base import FalAIProvider


class HappyHorseProvider(FalAIProvider):
    MODEL_MAP = {
        "txt2video": "alibaba/happy-horse/text-to-video",
        "img2video": "alibaba/happy-horse/image-to-video",
        "edit": "alibaba/happy-horse/video-edit",
    }
