"""
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""

from datetime import timedelta, timezone, datetime
import os
from typing import Annotated, TypeAlias
from uuid import uuid4
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
import jwt

# check if secret exists
print(os.getcwd())
if not os.path.exists("JWT_SECRET"):
    print("JWT secret not found. Generate one with `openssl rand -hex 32 > JWT_SECRET`")
    exit(1)

# load secret
with open("JWT_SECRET", "r") as f:
    JWT_SECRET = f.read()

JWT_ALGORITHM = "HS256"

# For production
ACCESS_TOKEN_EXPIRE_MINUTES = 5
REFRESH_TOKEN_EXPIRE_DAYS = 1

# For testing
# ACCESS_TOKEN_EXPIRE_MINUTES = 1
# REFRESH_TOKEN_EXPIRE_DAYS = 1 / 24 / 30

class Token(BaseModel):
    """Model returned after successful login.

    Providing tokens for interaction with the API.
    """
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    sub: str
    jti: str
    exp: datetime

def _create_token(jti: str, expires_delta: timedelta):
    to_encode = dict()
    to_encode.update({"sub": "user"})
    to_encode.update({"jti": jti})
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def _create_access_token(jti: str) -> str:
    """Create a token for accessing the API.

    Args:
        jti (str): the unique identifier of the token

    Returns:
        str: the token
    """
    return _create_token(jti, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

def _create_refresh_token(jti: str) -> str:
    """Create a token for refreshing the access token.
    
    Args:
        jti (str): the unique identifier of the token
        
    Returns:
        str: the token
    """
    return _create_token(jti, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))

def generate_refresh_token_timestamp() -> datetime:
    """Get the expiration timestamp of a refresh token from now.
    """
    return datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        

def create_token_pair() -> Token:
    """Create a pair of tokens for accessing the API and refreshing
    the access token.

    Returns:
        Token: the pair of tokens
    """
    
    # sharing the UUID allow to expire a refresh token
    # from an access token.
    uuid = str(uuid4())
    access_token = _create_access_token(uuid)
    refresh_token = _create_refresh_token(uuid)
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

Credentials: TypeAlias = Annotated[HTTPAuthorizationCredentials, Depends(HTTPBearer())]

def verify_token(credentials: Credentials) -> TokenData:
    """Verify the token provided in the request.
    
    Args:
        credentials (Credentials): the token provided in the request
        
    Raises:
        HTTPException: if the token is invalid or expired,
        or if the authentication scheme is invalid
        
    Returns:
        TokenData: the payload of the token
    """

    # based on https://stackoverflow.com/questions/76867554/fastapi-how-to-access-bearer-token
    
    # correct scheme?
    if not credentials.scheme == "Bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme"
        )
        
    try:
        # valid?
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        if not ("sub" in payload) or not ("exp" in payload):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        # expired?
        token_timestamp = datetime.fromtimestamp(payload["exp"], timezone.utc)
        if token_timestamp < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
            
        return TokenData(sub=payload["sub"], exp=token_timestamp, jti=payload["jti"])
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
