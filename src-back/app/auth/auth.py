"""
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""

from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel
from ..classes import Account

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
    
    return