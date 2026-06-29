from abc import ABC, abstractmethod


class BaseProvider(ABC):
    """Abstract interface for video generation providers."""

    @abstractmethod
    async def generate(self, params: dict) -> str:
        """Submit a generation job. Returns a provider-side reference ID."""
        ...

    @abstractmethod
    async def get_status(self, ref_id: str) -> dict:
        """Poll the generation status.

        Returns: {"status": "pending|processing|completed|failed",
                   "progress": 0..100,
                   "video_url": str | None,
                   "error": str | None}
        """
        ...

    @abstractmethod
    async def get_result(self, ref_id: str) -> str | None:
        """Get the resulting video URL once completed."""
        ...
