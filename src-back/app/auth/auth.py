"""
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""

from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, Request, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from ..classes import Account
import app.auth.jwt_utils as jwt_utils

router = APIRouter()

class RegisterBody(BaseModel):
    username: str
    password: str

@router.post("/user/register",
             status_code=status.HTTP_201_CREATED,
             description="Register a new user, if the username does not already exist.")
async def register(body: RegisterBody):
    # check that all API values are present
    if not body.username or not body.password:
        print("Missing username or password")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing username or password"
        )
    
    # check that the user does not already exist
    if Account.user_exists(body.username):
        print("Username already exists")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Username already exists"
        )
        
    # create the user
    Account.create_user(body.username, body.password)
    print("User created successfully")
    
    access_token_expires = timedelta(minutes=jwt_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = jwt_utils.create_access_token(
        data={"sub": body.username}, expires_delta=access_token_expires
    )
    
    return jwt_utils.Token(access_token=access_token, token_type="bearer")

class LoginBody(BaseModel):
    username: str
    password: str

@router.post("/user/login",
                status_code=status.HTTP_200_OK,
                description="Login a user.")
async def login(body: LoginBody) -> jwt_utils.Token:
    # check that all API values are present
    if not body.username or not body.password:
        print("Missing username or password")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing username or password"
        )
            
    # check that the password is correct
    if not Account.check_password(body.username, body.password)["status"] == "success":
        print("Connection refused")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Connection refused"
        )
    
    print("User logged in successfully")
    
    access_token_expires = timedelta(minutes=jwt_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = jwt_utils.create_access_token(
        data={"sub": body.username}, expires_delta=access_token_expires
    )
    
    return jwt_utils.Token(access_token=access_token, token_type="bearer")

@router.get("/user/auth_test", dependencies=[Depends(HTTPBearer())])
async def auth_test(credentials: jwt_utils.Credentials) -> JSONResponse:
    jwt_utils.verify_token(credentials)
    
    return JSONResponse(content={"status": "success", "message": "User is authenticated"}, media_type="application/json")