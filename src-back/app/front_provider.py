"""
Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""

from pathlib import Path
from fastapi import APIRouter, responses
import os

FRONTEND_DIST = Path("./dist")
router = APIRouter()

if not FRONTEND_DIST.exists():
    print("FRONTEND DIST NOT FOUND, IMPOSSIBLE TO SERVE THE FRONTEND")


@router.get(
    "/{path:path}",
)
async def frontend_handler(path: str):
    normalized_path = os.path.normpath(path)
    fp = FRONTEND_DIST / normalized_path
    allowed_path = str(fp).startswith(str(FRONTEND_DIST))
    if not fp.exists() or path == "" or not fp.is_file() or not allowed_path:
        fp = FRONTEND_DIST / "index.html"
    print(fp, "<<<<<<<<<<<<<<<<<<<<<<")

    # https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types/Common_types
    media_type = "text/html"
    if fp.suffix == ".js":
        media_type = "application/javascript"
    if fp.suffix == ".css":
        media_type = "text/css"
    if fp.suffix == ".json":
        media_type = "application/json"
    if fp.suffix == ".png":
        media_type = "image/png"
    if fp.suffix == ".jpg" or fp.suffix == ".jpeg":
        media_type = "image/jpeg"
    if fp.suffix == ".ico":
        media_type = "image/x-icon"
    if fp.suffix == ".svg":
        media_type = "image/svg+xml"
    if fp.suffix == ".woff2":
        media_type = "font/woff2"

    print(fp.suffix)
    print(media_type, "<<<<<<<<<<<<<<<<<<<<<<")
    return responses.FileResponse(fp, media_type=media_type)
