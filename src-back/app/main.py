"""
Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""

from fastapi import FastAPI
from .web_socket import router as ws_router
from .fight.fight_session import router as fight_router

app = FastAPI()
app.include_router(ws_router, prefix="/api/v1")
app.include_router(fight_router, prefix="/api/v1")
