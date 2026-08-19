from __future__ import annotations

import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.models import Context, ContextChunk  # noqa: E402
from backend.pipeline.generator import (  # noqa: E402
    AnswerGenerator,
    AnswerParseError,
    parse_answer_json,
)

CHUNK = ContextChunk(
    document_id="d1", chunk_id="d1_c0", text="स्टबहब का टोल फ्री नंबर 866-788-2482 है।", relevance=0.95
)
CTX = Context(chunks=[CHUNK], total_tokens=20)


def _ctx() -> Context:
    return CTX


def test_mock_generator_grounded():
    gen = AnswerGenerator(provider="mock")
    ans = gen.generate("स्टबहब टोल फ्री नंबर", _ctx())
    assert ans.grounded is True
    assert "866" in ans.text or "नंबर" in ans.text
    assert ans.sources[0].document_id == "d1"
    assert ans.provider == "mock"


def test_parse_valid_json():
    obj = parse_answer_json(
        '{"answer": "नई दिल्ली", "grounded": true, "confidence": 0.9, "sources": [{"document_id": "d1"}]}'
    )
    assert obj["answer"] == "नई दिल्ली"


def test_parse_fenced_json():
    obj = parse_answer_json('```json\n{"answer": "x", "grounded": true}\n```')
    assert obj["answer"] == "x"


def test_parse_with_prose_wrapper():
    obj = parse_answer_json('Here is the answer: {"answer": "y", "grounded": false, "confidence": 0.1}')
    assert obj["answer"] == "y"


def test_parse_malformed_raises():
    with pytest.raises(AnswerParseError):
        parse_answer_json("totally not json")
    with pytest.raises(AnswerParseError):
        parse_answer_json('{"no_answer_key": true}')


def test_validate_rejects_sources_outside_context(monkeypatch):
    from backend.pipeline.generator import _openai_chat

    # a fake OpenAI-compatible chat returning a hallucinated source id
    def fake_chat(messages, temperature):
        return (
            '{"answer": "जवाब", "grounded": true, "confidence": 0.9, '
            '"sources": [{"document_id": "NOT_IN_CONTEXT"}]}'
        )

    monkeypatch.setattr("backend.pipeline.generator._openai_chat", fake_chat)
    gen = AnswerGenerator(provider="openai")
    ans = gen.generate("कुछ सवाल", _ctx())
    assert ans.sources == []  # out-of-context source dropped
    assert ans.text == "जवाब"


def test_malformed_output_falls_back_to_mock(monkeypatch):
    def bad_chat(messages, temperature):
        return "gibberish no json"

    monkeypatch.setattr("backend.pipeline.generator._openai_chat", bad_chat)
    gen = AnswerGenerator(provider="openai")
    ans = gen.generate("स्टबहब टोल फ्री नंबर", _ctx())
    # bounded retries exhausted → safe extractive fallback, still an answer
    assert ans.text
    assert ans.provider.startswith("mock-fallback")


def test_empty_answer_raises_on_first_attempt(monkeypatch):
    def empty_chat(messages, temperature):
        return '{"answer": "", "grounded": true, "confidence": 0.9}'

    monkeypatch.setattr("backend.pipeline.generator._openai_chat", empty_chat)
    gen = AnswerGenerator(provider="openai")
    ans = gen.generate("सवाल", _ctx())
    assert ans.provider.startswith("mock-fallback")
