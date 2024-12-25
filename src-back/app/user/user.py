"""
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""

from fastapi.responses import JSONResponse
from ..auth import jwt_utils
from fastapi import APIRouter, status
from app.classes import Account

router = APIRouter()


@router.get(
    "/user/me",
    status_code=status.HTTP_200_OK,
    description="Get the current user's information.",
)
async def me(credentials: jwt_utils.Credentials):
    token_data = jwt_utils.verify_token(credentials)

    user_info = Account.get_user_info(token_data.sub)

    if user_info is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "User not found"},
        )

    return user_info
