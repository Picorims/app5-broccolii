from .classes import Account
import random
from fastapi import APIRouter, status
from .auth import jwt_utils


"""Click route"""
router = APIRouter()


@router.patch(
    "/click",
    status_code=status.HTTP_200_OK,
    description="Get the current user's information.",
)
async def me(credentials: jwt_utils.Credentials):
    token_data = jwt_utils.verify_token(credentials)

    user_info = Account.get_user_info(token_data.sub)
    print(user_info)

    # if requete blabla pas réussi :
    """
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "User not found"},
        )
    """

    return user_info


def single_click(account, cards):
    broccoli_amount = 1

    # card_id_list = [elem.id for elem in cards]
    card_id_list = cards

    # critical_click_chances = account.critical_click_chances
    critical_click_chances = 1

    """Checking for critical click occurence before applying score modifying cards"""
    for card_id in card_id_list:
        match card_id:
            case 13:
                critical_click_chances += 10
            case 14:
                critical_click_chances += 10
            case 15:
                critical_click_chances *= 2
            case 16:
                critical_click_chances *= 2

    """If a critical click occurs, applying *5 score"""
    if random.uniform(0, 100) < critical_click_chances:
        broccoli_amount *= 5

    """Applying score modifying cards"""
    for card_id in card_id_list:
        match card_id:
            case 9:
                broccoli_amount *= 2
            case 10:
                broccoli_amount *= 2
            case 11:
                broccoli_amount += 5
            case 12:
                broccoli_amount += 5

    # account.broccolli += broccoli_amount
    return broccoli_amount


print("click broccoli amount")
print((((1 * 2) * 2) + 5) + 5, single_click("Account", [9, 10, 11, 12]))
print((((5 * 2) * 2) + 5) + 5, single_click("Account", [13, 13, 13, 15, 15, 9, 10, 11, 12]))


def passive_income(account, cards):
    """
    called every seconds by the server for each user ?
    """
    broccoli_amount = 0

    # card_id_list = [elem.id for elem in cards]
    card_id_list = cards

    for card_id in card_id_list:
        match card_id:
            case 1:
                broccoli_amount += 1
            case 2:
                broccoli_amount += 1
            case 3:
                broccoli_amount *= 2
            case 4:
                broccoli_amount *= 2
            case 5:
                broccoli_amount += 1
            case 6:
                broccoli_amount += 1
            case 7:
                broccoli_amount *= 2
            case 8:
                broccoli_amount *= 2

    # account.broccolli += broccoli_amount
    return broccoli_amount


print("\npassive broccoli income")
print(
    ((((((1 + 1) * 2) * 2) + 1) + 1) * 2) * 2, passive_income("Account", [1, 2, 3, 4, 5, 6, 7, 8])
)
