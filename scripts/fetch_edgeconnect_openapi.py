#!/usr/bin/env python3
"""Fetch EdgeConnect or Orchestrator OpenAPI JSON from a live system."""

from __future__ import annotations

import argparse
import json
import ssl
import sys
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen


API_PATHS = {
    "orchestrator": (
        "apiDocs/gmsApiInfo.json",
        "webclient/html/apiDocs/gmsApiInfo.json",
    ),
    "appliance": (
        "node/apiDocs/vxoaApiInfo.json",
        "apiDocs/vxoaApiInfo.json",
    ),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fetch HPE Aruba EdgeConnect OpenAPI/Swagger JSON."
    )
    parser.add_argument(
        "--base-url",
        required=True,
        help="Base URL for Orchestrator or EdgeConnect, for example https://host",
    )
    parser.add_argument(
        "--type",
        choices=sorted(API_PATHS),
        required=True,
        help="Target API definition type.",
    )
    parser.add_argument(
        "--output",
        required=True,
        help="Path where the JSON definition should be written.",
    )
    parser.add_argument(
        "--token",
        help="Optional API key or bearer token to send as Authorization: Bearer.",
    )
    parser.add_argument(
        "--insecure",
        action="store_true",
        help="Disable TLS certificate verification for lab systems.",
    )
    parser.add_argument(
        "--path",
        action="append",
        default=[],
        help="Additional relative JSON path to try before built-in candidates.",
    )
    return parser.parse_args()


def candidate_urls(base_url: str, paths: Iterable[str]) -> Iterable[str]:
    root = base_url.rstrip("/") + "/"
    for path in paths:
        yield urljoin(root, path.lstrip("/"))


def fetch_json(url: str, token: str | None, insecure: bool) -> object:
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    context = None
    if insecure:
        context = ssl._create_unverified_context()

    request = Request(url, headers=headers)
    with urlopen(request, context=context, timeout=30) as response:
        body = response.read().decode("utf-8")
    return json.loads(body)


def main() -> int:
    args = parse_args()
    paths = tuple(args.path) + API_PATHS[args.type]
    errors = []

    for url in candidate_urls(args.base_url, paths):
        try:
            payload = fetch_json(url, args.token, args.insecure)
            output = Path(args.output)
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n")
            print(f"Fetched {args.type} API definition from {url}")
            print(f"Wrote {output}")
            return 0
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
            errors.append(f"{url}: {exc}")

    print("Unable to fetch API definition. Tried:", file=sys.stderr)
    for error in errors:
        print(f"  - {error}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
