"""Speech-to-text providers.

* ``mock`` — no network. Returns a fixed sample transcript (or the text the
  caller supplied for testing) and marks itself as mock. Used for local dev,
  CI and demos without API keys.
* ``sarvam`` — Sarvam AI ``speech-to-text`` endpoint (Hindi/Indian languages).
* ``elevenlabs`` — ElevenLabs ``speech-to-text`` endpoint.

External STT adds unavoidable network latency; the orchestrator reports STT
time separately from RAG-core time so it is never hidden.
"""

from __future__ import annotations

from backend.config import settings


class SttProvider:
    def __init__(self, provider: str | None = None) -> None:
        self.provider = (provider or settings.stt_provider).lower()
        if self.provider not in ("mock", "sarvam", "elevenlabs"):
            raise ValueError(f"unknown stt_provider: {self.provider}")

    @property
    def name(self) -> str:
        return self.provider

    # ------------------------------------------------------------- interface
    def transcribe(self, audio: bytes, *, text_hint: str = "") -> str:
        """Return the transcript for ``audio`` bytes.

        ``text_hint`` lets tests/mock mode inject the expected transcript
        without a real audio file (and is never used by real providers).
        """
        if self.provider == "mock":
            return text_hint or settings.mock_stt_transcript
        if self.provider == "sarvam":
            return self._sarvam(audio)
        return self._elevenlabs(audio)

    # ------------------------------------------------------------- providers
    def _sarvam(self, audio: bytes) -> str:
        import httpx

        # Detect content type from magic bytes (browser sends webm/mp4)
        content_type = "audio/wav"
        if audio[:4] == b"\x1aE\xdf\xa3":
            content_type = "audio/webm"
        elif audio[:4] == b"\x00\x00\x00\x1c" or audio[4:8] == b"ftyp":
            content_type = "audio/mp4"
        elif audio[:4] == b"OggS":
            content_type = "audio/ogg"

        resp = httpx.post(
            "https://api.sarvam.ai/speech-to-text",
            headers={"api-subscription-key": settings.sarvam_api_key},
            files={"file": ("audio.webm", audio, content_type)},
            data={
                "language_code": settings.sarvam_language_code,
                "model": settings.sarvam_stt_model,
                "with_timestamps": "false",
            },
            timeout=60.0,
        )
        resp.raise_for_status()
        body = resp.json()
        # Handle both response shapes
        if "transcript" in body:
            t = body["transcript"]
            text = t["transcript"] if isinstance(t, dict) else t
        else:
            text = body.get("text", "")
        if not text or not text.strip():
            raise ValueError("Sarvam STT returned empty transcript (no speech detected)")
        return text

    def _elevenlabs(self, audio: bytes) -> str:
        import httpx

        resp = httpx.post(
            "https://api.elevenlabs.io/v1/speech-to-text",
            headers={"xi-api-key": settings.elevenlabs_api_key},
            files={"file": ("audio.wav", audio, "audio/wav")},
            data={"model_id": settings.elevenlabs_stt_model},
            timeout=60.0,
        )
        resp.raise_for_status()
        return resp.json()["text"]
