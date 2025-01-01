"""
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""

from fastapi.responses import JSONResponse
from ..auth import jwt_utils
from fastapi import APIRouter, status, HTTPException
from app.classes import Account, UserInfo
from pydantic import BaseModel

router = APIRouter()


@router.get(
    "/user/me",
    status_code=status.HTTP_200_OK,
    description="Get the current user's information.",
    tags=["user"],
    responses={
        200: {
            "description": "User information retrieved successfully",
        },
        404: {"description": "User not found"},
    },
    response_model=UserInfo,
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


class ClickBody(BaseModel):
    username: str


@router.patch(
    "/user/click",
    status_code=status.HTTP_200_OK,
    description="Registers the click on the broccoli",
    tags=["user", "clicker"],
    response_model=dict[str, str],
    responses={
        200: {
            "description": "Click registered successfully",
        },
        400: {"description": "Missing username"},
    },
)
async def click(body: ClickBody):
    # check that all API values are present
    if body.username is None:
        print("Missing username")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing username")

    response = Account.route_click_placeholder(body.username)

    return JSONResponse(
        content=response,
        media_type="application/json",
    )


class BroccoBody(BaseModel):
    username: str


@router.post(
    "/user/broccolis",
    status_code=status.HTTP_200_OK,
    description="Returns the amount of broccolis of the user",
    tags=["user", "clicker"],
    response_model=dict[str, str],
    responses={
        200: {
            "description": "Returned successfully",
        },
        400: {"description": "Missing username"},
    },
)
async def brocco(body: BroccoBody):
    # check that all API values are present
    if body.username is None:
        print("Missing username")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing username")

    response = Account.get_broccoli_amount(body.username)
    if response is not None and len(response) != 0:
        response = {"status": "success", "broccolis": response[0]}
    else:
        response = {"status": "error", "message": "broccoli not found"}

    return JSONResponse(
        content=response,
        media_type="application/json",
    )
