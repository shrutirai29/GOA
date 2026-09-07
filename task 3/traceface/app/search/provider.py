"""
Reverse Image Search Provider
Uses SerpAPI's Google Lens endpoint for genuine reverse image search.
Also supports Bing Visual Search.
"""
import base64
import io
import os
import tempfile
from typing import List, Optional
from urllib.parse import urlparse

import cv2
import httpx
import numpy as np

from .base import BaseSearchProvider, SearchResult


class SerpAPIReverseImageProvider(BaseSearchProvider):
    """
    Real reverse image search using SerpAPI (Google Lens).
    Requires SERPAPI_KEY environment variable.
    """

    API_URL = "https://serpapi.com/search.json"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("SEARCH_API_KEY", "")

    @property
    def name(self) -> str:
        return "SerpAPI (Google Lens)"

    @property
    def is_real_search(self) -> bool:
        return bool(self.api_key)

    def requires_api_key(self) -> bool:
        return True

    def search(self, image: np.ndarray, query: str = "") -> List[SearchResult]:
        """Perform a real reverse image search via SerpAPI Google Lens."""
        if not self.api_key:
            raise ValueError("SerpAPI key not configured. Set SEARCH_API_KEY.")

        # Save image to temp file for upload
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
            cv2.imwrite(f.name, image)
            temp_path = f.name

        try:
            with open(temp_path, "rb") as img_file:
                image_data = base64.b64encode(img_file.read()).decode("utf-8")

            params = {
                "engine": "google_lens",
                "api_key": self.api_key,
                "image": f"data:image/png;base64,{image_data}",
            }
            if query:
                params["query"] = query

            with httpx.Client(timeout=30.0) as client:
                response = client.get(self.API_URL, params=params)
                response.raise_for_status()
                data = response.json()

            return self._parse_results(data)

        finally:
            os.unlink(temp_path)

    def _parse_results(self, data: dict) -> List[SearchResult]:
        """Parse SerpAPI response into SearchResult objects."""
        results = []

        # Parse visual matches
        for match in data.get("visual_matches", []):
            results.append(SearchResult(
                title=match.get("title", "Untitled"),
                source_url=match.get("link", ""),
                image_url=match.get("thumbnail", match.get("original", "")),
                source_domain=self._extract_domain(match.get("link", "")),
                snippet=match.get("snippet", ""),
                provider=self.name,
                relevance_score=match.get("position", 0),
            ))

        # Parse text results if present
        for item in data.get("text_results", []):
            results.append(SearchResult(
                title=item.get("title", "Untitled"),
                source_url=item.get("link", ""),
                image_url=item.get("thumbnail", ""),
                source_domain=self._extract_domain(item.get("link", "")),
                snippet=item.get("snippet", ""),
                provider=self.name,
                relevance_score=item.get("position", 0),
            ))

        return results

    @staticmethod
    def _extract_domain(url: str) -> str:
        try:
            parsed = urlparse(url)
            return parsed.netloc or parsed.path
        except Exception:
            return url


class BingVisualSearchProvider(BaseSearchProvider):
    """
    Real reverse image search using Bing Visual Search API.
    Requires SEARCH_API_KEY to be the Bing API key.
    """

    API_URL = "https://api.bing.visualsearch.microsoft.com/v7.0/images/visualsearch"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("SEARCH_API_KEY", "")

    @property
    def name(self) -> str:
        return "Bing Visual Search"

    @property
    def is_real_search(self) -> bool:
        return bool(self.api_key)

    def requires_api_key(self) -> bool:
        return True

    def search(self, image: np.ndarray, query: str = "") -> List[SearchResult]:
        if not self.api_key:
            raise ValueError("Bing API key not configured. Set SEARCH_API_KEY.")

        _, img_bytes = cv2.imencode(".png", image)

        headers = {
            "Ocp-Apim-Subscription-Key": self.api_key,
        }

        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                self.API_URL,
                headers=headers,
                files={"image": ("face.png", img_bytes.tobytes(), "image/png")},
                data={"knowledgeRequest": '{"imageInfo":{"cropArea":{"left":0,"top":0,"right":1,"bottom":1}}}'},
            )
            response.raise_for_status()
            data = response.json()

        return self._parse_results(data)

    def _parse_results(self, data: dict) -> List[SearchResult]:
        results = []

        # Bing returns tags with actions
        for tag in data.get("tags", []):
            for action in tag.get("actions", []):
                if action.get("actionType") == "DiscoverPages":
                    for page in action.get("data", {}).get("value", []):
                        results.append(SearchResult(
                            title=page.get("name", "Untitled"),
                            source_url=page.get("url", ""),
                            image_url=page.get("thumbnailUrl", ""),
                            source_domain=self._extract_domain(page.get("url", "")),
                            snippet=page.get("description", ""),
                            provider=self.name,
                        ))
                elif action.get("actionType") == "VisualSearch":
                    for item in action.get("data", {}).get("results", []):
                        results.append(SearchResult(
                            title=item.get("name", "Untitled"),
                            source_url=item.get("hostPageUrl", ""),
                            image_url=item.get("thumbnailUrl", ""),
                            source_domain=self._extract_domain(item.get("hostPageUrl", "")),
                            snippet=item.get("snippet", ""),
                            provider=self.name,
                        ))

        return results

    @staticmethod
    def _extract_domain(url: str) -> str:
        try:
            parsed = urlparse(url)
            return parsed.netloc or parsed.path
        except Exception:
            return url


def get_provider(provider_name: Optional[str] = None) -> BaseSearchProvider:
    """
    Factory function to get the appropriate search provider.

    Args:
        provider_name: 'serpapi', 'bing', or 'demo'. If None, uses config.

    Returns:
        Configured search provider instance
    """
    if provider_name is None:
        from ..config import config
        provider_name = config.get_search_provider()

    provider_name = provider_name.lower().strip()

    if provider_name in ("serpapi", "google_lens", "google"):
        return SerpAPIReverseImageProvider()
    elif provider_name == "bing":
        return BingVisualSearchProvider()
    else:
        from .demo_provider import DemoSearchProvider
        return DemoSearchProvider()
