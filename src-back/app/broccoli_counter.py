import pickle
from classes import Account, Token as TokenDB

with open("cards.pkl", "rb") as file:
    cards = pickle.load(file)

blabla = user()
user.broccoli


def single_click():
    broccoli_amount = 1


def count_broccoli(click_amount, active_card_list):
    """
    returns boccoli amount given click_amount.
    currently it needs a active_card_list argument, but int the fucture this
        function will locate the list.
    the active_card_list is a list of functions corresponding to the effects
        of each active booster card
    """

    broccoli_amount = click_amount

    # the booster cards' order has an importance as each effects
    #   is treated in the order of the cards
    for booster_card in active_card_list:
        broccoli_amount = booster_card(broccoli_amount)

    return broccoli_amount


# the following functions are example booster cards to test count_broccoli()
def booster_card_1(click_amount):
    return click_amount * 3


def booster_card_2(click_amount):
    return click_amount + 150


if __name__ == "__main__":
    clicks = 10
    list_order_1 = [booster_card_1, booster_card_2]
    list_order_2 = [booster_card_2, booster_card_1]
    print("10 clicks *3, +150 :", count_broccoli(clicks, list_order_1))
    print("10 clicks +150, *3 :", count_broccoli(clicks, list_order_2))
