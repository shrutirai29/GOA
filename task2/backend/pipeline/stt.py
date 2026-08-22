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
    def transcribe(self, audio: bytes, *, text_hint: str = "") -> tuple[str, str]:
        """Return (transcript, detected_language) for ``audio`` bytes.

        ``text_hint`` lets tests/mock mode inject the expected transcript
        without a real audio file (and is never used by real providers).
        """
        if self.provider == "mock":
            return (text_hint or settings.mock_stt_transcript), ""
        if self.provider == "sarvam":
            return self._sarvam(audio)
        return self._elevenlabs(audio), ""

    # ------------------------------------------------------------- providers
    def _sarvam(self, audio: bytes) -> str:
        import httpx

        # Sarvam only supports WAV. Convert browser formats (webm/mp4/ogg) to WAV.
        audio, content_type = self._ensure_wav(audio)

        resp = httpx.post(
            "https://api.sarvam.ai/speech-to-text",
            headers={"api-subscription-key": settings.sarvam_api_key},
            files={"file": ("audio.wav", audio, content_type)},
            data={
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
    @staticmethod
    def _ensure_wav(audio: bytes) -> tuple[bytes, str]:
        """Convert browser audio (webm/mp4/ogg) to WAV for Sarvam."""
        # Check if already WAV
        if audio[:4] == b"RIFF":
            return audio, "audio/wav"
        # Convert using pydub
        try:
            from pydub import AudioSegment
            import io
            seg = AudioSegment.from_file(io.BytesIO(audio))
            seg = seg.set_frame_rate(16000).set_channels(1).set_sample_width(2)
            buf = io.BytesIO()
            seg.export(buf, format="wav")
            return buf.getvalue(), "audio/wav"
        except Exception:
            # If conversion fails, send as-is and hope for the best
            return audio, "audio/wav"

        # Return transcript + detected language_code so caller can use it
        raw_lang = body.get("language_code", "")
        # Convert Sarvam format ("hi-IN") to our format ("hi")
        lang_map = {
            "hi-IN": "hi", "en-IN": "eng", "bn-IN": "ben", "gu-IN": "guj",
            "mr-IN": "mar", "ne-IN": "nep", "or-IN": "ori", "as-IN": "asm",
            "ta-IN": "tam", "te-IN": "tel", "kn-IN": "kan", "ml-IN": "mal",
            "pa-IN": "pan", "ur-IN": "urd",
        }
        detected_lang = lang_map.get(raw_lang, raw_lang.split("-")[0] if raw_lang else "")
        return text, detected_lang

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
