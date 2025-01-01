from fastapi import APIRouter, status, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from ..classes import Account


router = APIRouter()


class AddCardBody(BaseModel):
    username: str
    cardId: str


class GetCardBody(BaseModel):
    username: str


@router.post(
    "/card/get-cards",
    status_code=status.HTTP_200_OK,
    description="Gets the list of the cards ids of the user.",
    tags=["user", "card"],
    responses={
        201: {
            "description": "Cards ids retrieved successfully",
        },
        400: {"description": "Missing username"},
    },
    response_model=dict[str, str],
)
async def getOwnedCards(body: GetCardBody):
    # check that all API values are present
    if body.username is None:
        print("Missing username")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing username")

    response = Account.get_owned_cards(body.username)

    return JSONResponse(
        content=response,
        media_type="application/json",
    )


@router.post(
    "/card/get-equipped-cards",
    status_code=status.HTTP_200_OK,
    description="Gets the list of the cards ids of the user that aren't equipped.",
    tags=["user", "card"],
    responses={
        201: {
            "description": "Cards ids retrieved successfully",
        },
        400: {"description": "Missing username"},
    },
    response_model=dict[str, str],
)
async def getEquippedCards(body: GetCardBody):
    # check that all API values are present
    if body.username is None:
        print("Missing username")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing username")
    response = Account.get_cards(body.username)
    return JSONResponse(
        content=response,
        media_type="application/json",
    )


@router.post(
    "/card/get-unequipped-cards",
    status_code=status.HTTP_200_OK,
    description="Gets the list of the cards ids of the user that aren't equipped.",
    tags=["user", "card"],
    responses={
        201: {
            "description": "Cards ids retrieved successfully",
        },
        400: {"description": "Missing username"},
    },
    response_model=dict[str, str],
)
async def getUnequippedCards(body: GetCardBody):
    # check that all API values are present
    if body.username is None:
        print("Missing username")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing username")

    response = Account.get_unequipped_cards(body.username)

    return JSONResponse(
        content=response,
        media_type="application/json",
    )


@router.post(
    "/card/add",
    status_code=status.HTTP_201_CREATED,
    description="Adds a card.",
    tags=["user", "card"],
    responses={
        201: {
            "description": "Card added successfully",
        },
        400: {"description": "Missing username or cardId"},
    },
    response_model=dict[str, str],
)
async def addCard(body: AddCardBody):
    # print("addCard :", body.username, body.cardId)
    # check that all API values are present
    if body.username is None or body.cardId is None:
        print("Missing username or cardId")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Missing username or cardId"
        )

    response = Account.add_card_from_username(body.username, body.cardId)

    return JSONResponse(
        content=response,
        media_type="application/json",
    )


class EquipCardBody(BaseModel):
    username: str
    cardId: str


@router.patch(
    "/card/equip",
    status_code=status.HTTP_201_CREATED,
    description="Equips a card for a user.",
    tags=["user", "card"],
    responses={
        201: {
            "description": "Card equipped successfully",
        },
        400: {"description": "Missing username or cardId"},
    },
    response_model=dict[str, str],
)
async def equipCard(body: EquipCardBody):
    print("equipCard :", body.username, body.cardId)
    # check that all API values are present
    if body.username is None or body.cardId is None:
        print("Missing username or cardId")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Missing username or cardId"
        )

    response = Account.equip_card_from_username(body.username, body.cardId)

    return JSONResponse(
        content=response,
        media_type="application/json",
    )


class UnequipCardBody(BaseModel):
    username: str
    cardId: str


@router.patch(
    "/card/unequip",
    status_code=status.HTTP_201_CREATED,
    description="Unequips a card for a user.",
    tags=["user", "card"],
    responses={
        201: {
            "description": "Card unequipped successfully",
        },
        400: {"description": "Missing username or cardId"},
    },
    response_model=dict[str, str],
)
async def unequipCard(body: UnequipCardBody):
    print("unequipCard :", body.username, body.cardId)
    # check that all API values are present
    if body.username is None or body.cardId is None:
        print("Missing username or cardId")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Missing username or cardId"
        )

    response = Account.unequip_card_from_username(body.username, body.cardId)

    return JSONResponse(
        content=response,
        media_type="application/json",
    )
