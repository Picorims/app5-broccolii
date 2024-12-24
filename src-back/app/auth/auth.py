"""
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""

from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from ..classes import Account, Token as TokenDB
import app.auth.jwt_utils as jwt_utils

router = APIRouter()


class RegisterBody(BaseModel):
    username: str
    password: str


@router.post(
    "/user/register",
    status_code=status.HTTP_201_CREATED,
    description="Register a new user, if the username does not already exist.",
)
async def register(body: RegisterBody):
    # check that all API values are present
    if not body.username or not body.password:
        print("Missing username or password")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Missing username or password"
        )

    # check that the username is respecting rules
    if not Account.valid_username(body.username):
        print("Invalid username")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid username")

    # check that the user does not already exist
    if Account.user_exists(body.username):
        print("Username already exists")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Username already exists")

    # create the user
    Account.create_user(body.username, body.password)
    print("User created successfully")

    return jwt_utils.create_token_pair()


class LoginBody(BaseModel):
    username: str
    password: str


@router.post("/user/login", status_code=status.HTTP_200_OK, description="Login a user.")
async def login(body: LoginBody) -> jwt_utils.Token:
    # check that all API values are present
    if not body.username or not body.password:
        print("Missing username or password")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Missing username or password"
        )

    # check that the password is correct
    if not Account.check_password(body.username, body.password)["status"] == "success":
        print("Connection refused")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Connection refused")

    print("User logged in successfully")

    return jwt_utils.create_token_pair()


#EXEMPLE DE ROUTE qui demande une authentification du user, elle ne fait rien
@router.get("/user/auth_test", dependencies=[Depends(HTTPBearer())])
async def auth_test(credentials: jwt_utils.Credentials) -> JSONResponse:
    jwt_utils.verify_token(credentials)

    return JSONResponse(
        content={"status": "success", "message": "User is authenticated"},
        media_type="application/json",
    )


@router.get(
    "/user/refresh_token",
    description="Refresh the access token. The bearer must be the refresh token.",
)
async def refresh_token(credentials: jwt_utils.Credentials) -> jwt_utils.Token:
    token_data = jwt_utils.verify_token(credentials)

    if TokenDB.is_jti_blacklisted(token_data.jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )

    return jwt_utils.create_token_pair()


@router.get("/user/logout", description="Logout the user. The bearer must be the access token.")
async def logout(credentials: jwt_utils.Credentials):
    token_data = jwt_utils.verify_token(credentials)

    TokenDB.invalidate_jti(token_data.jti)

    return JSONResponse(
        content={"status": "success", "message": "User logged out"}, media_type="application/json"
    )
