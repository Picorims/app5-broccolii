# -*- coding: utf-8 -*-
import random
import sqlite3
import bcrypt
from datetime import datetime

from pydantic import BaseModel
from .auth.jwt_utils import generate_refresh_token_timestamp
import re


db_name = "broccolii.db"
connection = sqlite3.connect(db_name)
cursor = connection.cursor()
print("Connected to the database")
VERBOSE = False


# %% Class Definitions
class Category:
    def __init__(self, id, name):
        self.id = id
        self.name = name.capitalize()

    def print_category(self):
        print(f"{self.id}: {self.name}")


class Word:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.category = []

    def get_word(self) -> str:
        return self.name.capitalize()

    def add_category(self, categoryId):
        categoryName = cursor.execute(
            f"SELECT name FROM Category WHERE id = {categoryId}"
        ).fetchone()[0]
        self.category.append(Category(categoryId, categoryName))

    def word_in_category(self, category):
        return category in self.category

    def print_category(self):
        for i in self.category:
            i.print_category()

    def print_word(self):
        print(f" {self.get_word()}")
        self.print_category()

    def remove_category(self, category):
        if self.word_in_category(category):
            self.category.remove(category)


class Card:
    def __init__(self, id, name, effect, rarity, isNegative, adding, multiplyBy):
        self.id = id
        self.name = name.capitalize()
        self.effect = effect
        self.rarity = rarity
        self.isNegative = isNegative
        self.adding = adding
        self.multiplyBy = multiplyBy

    def print_card(self):
        negative = "Negative " if self.isNegative else ""
        print(f"{self.id}: {negative}{self.name} - {self.rarity}")
        print(f" {self.effect}")
        print(f" Adds: {self.adding} - Multiplies by: {self.multiplyBy}")


class UserInfo(BaseModel):
    username: str
    broccolis: int


class Account:
    def __init__(self, id, broccolis, username, cards):
        self.id = id
        self.broccolis = broccolis
        self.username = username
        self.cards = cards

    def add_card(self, card):
        connection = sqlite3.connect(db_name)
        cursor = connection.cursor()
        self.cards.append([card, 0])
        cursor.execute(f"INSERT INTO AccountCard VALUES ({self.id}, {card.id}, 0)")
        cursor.close()
        connection.close()

    @staticmethod
    def add_card_from_username(username, card_id):
        connection = sqlite3.connect(db_name)
        cursor = connection.cursor()

        req = "SELECT id FROM Account WHERE Account.username = ?"
        cursor.execute(req, (username,))
        resultId = cursor.fetchone()
        if resultId is None:
            return {"status": "error", "message": "Account not found."}
        user_id = resultId[0]

        req2 = "INSERT INTO AccountCard VALUES (?, ?, 0)"
        cursor.execute(req2, (user_id, card_id))
        print("res insertion : ", cursor.fetchone())

        connection.commit()
        cursor.close()
        connection.close()
        return {"status": "success", "message": "Card added to account."}

    def equip_card(self, card):
        connection = sqlite3.connect(db_name)
        cursor = connection.cursor()
        self.cards = [[c, 1] if c == card else [c, v] for c, v in self.cards]
        cursor.execute(
            f"UPDATE AccountCard SET isEquipped = 1 WHERE (idAccount = {self.id}\n"
            f"AND idCard = {card.id})"
        )
        cursor.close()
        connection.close()

    def equip_card_from_username(username, cardId):
        # WARNING this function equips ALL the cards that have cardId
        # (if the user possesses multiple times the same card)
        connection = sqlite3.connect(db_name)
        cursor = connection.cursor()

        req = "SELECT id FROM Account WHERE Account.username = ?"
        cursor.execute(req, (username,))
        resultId = cursor.fetchone()
        if resultId is None:
            return {"status": "error", "message": "Account not found."}
        user_id = resultId[0]

        req2 = "SELECT * FROM AccountCard WHERE idAccount = ?"
        req2 += "AND idCard = ? AND isEquipped = 0"
        cursor.execute(req2, (user_id, cardId))
        resultCards = cursor.fetchone()

        if resultCards is None:
            return {"status": "error", "message": "Account does not own the card."}

        req3 = "UPDATE AccountCard SET isEquipped = 1 "
        req3 += "WHERE idAccount = ? AND idCard = ?"
        cursor.execute(req3, (user_id, cardId))

        req4 = "SELECT * from AccountCard WHERE idAccount = ?"
        cursor.execute(req4, (user_id,))
        print(f"all cards from {username}\n:, {cursor.fetchall()}")

        connection.commit()
        cursor.close()
        connection.close()

        # TODO make the following line work
        # self.cards = [[c, 1] if c == card else [c, v] for c, v in self.cards]
        return {"status": "success", "message": "Equipped card."}

    def unequip_card(self, card):
        self.cards = [[c, 1] if c == card else [c, v] for c, v in self.cards]
        # TODO: this request won't work. modify inpired by above working request
        cursor.execute(
            f"UPDATE TABLE AccountCard SET isEquipped = 0 WHERE idAccount = {self.id}\n"
            f"AND idCard = {card.id})"
        )

    def unequip_card_from_username(username, cardId):
        # WARNING this function unequips ALL the cards that have cardId
        # (if the user possesses multiple times the same card)
        connection = sqlite3.connect(db_name)
        cursor = connection.cursor()

        req = "SELECT id FROM Account WHERE Account.username = ?"
        cursor.execute(req, (username,))
        resultId = cursor.fetchone()
        if resultId is None:
            return {"status": "error", "message": "Account not found."}
        user_id = resultId[0]
        print("id user", user_id)

        req2 = "SELECT * FROM AccountCard WHERE idAccount = ?"
        req2 += "AND idCard = ? AND isEquipped = 1"
        cursor.execute(req2, (user_id, cardId))
        resultCards = cursor.fetchone()
        print("la carte :", resultCards)

        if resultCards is None:
            return {"status": "error", "message": "Account does not own the card."}

        req3 = "UPDATE AccountCard SET isEquipped = 0 "
        req3 += "WHERE idAccount = ? AND idCard = ?"
        cursor.execute(req3, (user_id, cardId))

        connection.commit()
        cursor.close()
        connection.close()

        # TODO make the following line work
        # self.cards = [[c, 1] if c == card else [c, v] for c, v in self.cards]
        return {"status": "success", "message": "Equipped card."}

    @staticmethod
    def get_cards(username):
        connection = sqlite3.connect(db_name)
        cursor = connection.cursor()
        req = """
            SELECT idCard
            FROM AccountCard
            INNER JOIN Account ON AccountCard.idAccount = Account.id
            WHERE Account.username = ?
        """
        cursor.execute(req, (username,))
        result = cursor.fetchall()
        cursor.close()
        connection.close()
        return result

    @staticmethod
    def user_exists(login):
        connection = sqlite3.connect(db_name)
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM Account WHERE username = ?", (login,))
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        return result is not None

    @staticmethod
    def create_user(login, password):
        if Account.user_exists(login):
            return {"status": "error", "message": "Username already exists"}
        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        connection = sqlite3.connect(db_name)
        cursor = connection.cursor()

        cursor.execute(
            "INSERT INTO Account (username, password) VALUES (?, ?)", (login, hashed_password)
        )
        connection.commit()
        cursor.close()
        connection.close()

        return {"status": "success", "message": "User created successfully"}

    @staticmethod
    def check_password(login, password):
        connection = sqlite3.connect(db_name)
        cursor = connection.cursor()

        cursor.execute("SELECT password FROM Account WHERE username = ?", (login,))
        result = cursor.fetchone()

        cursor.close()
        connection.close()

        if result is None:
            return {"status": "error", "message": "User does not exist"}

        stored_password = result[0]
        if bcrypt.checkpw(password.encode("utf-8"), stored_password.encode("utf-8")):
            return {"status": "success", "message": "Password is correct"}
        else:
            return {"status": "error", "message": "Incorrect password"}

    @staticmethod
    def valid_username(username: str) -> bool:
        """Check if the username is valid.

        (between 3 and 32 alphanumeric characters and underscores)

        Args:
            username (str): the username to check.

        Returns:
            bool: True if the username is valid, False otherwise.
        """
        return re.match(r"^[a-zA-Z0-9_]{3,32}$", username) is not None

    @staticmethod
    def get_user_info(username: str):
        connection = sqlite3.connect(db_name)
        cursor = connection.cursor()
        cursor.execute("SELECT username, broccolis FROM Account WHERE username = ?", (username,))
        result = cursor.fetchone()
        cursor.close()
        connection.close()

        if result is None:
            return None
        return UserInfo(username=result[0], broccolis=result[1])

    @staticmethod
    def route_click_placeholder(username):
        cards = [
            elem[0] for elem in Account.get_cards(username)
        ]  # turning a list of tuples into a list of integers
        print(cards)

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

        return {
            "status": "unknown",
            "message": "TODO",
            "broccolis": broccoli_amount,
            "cards": cards,
        }


class Token:

    @staticmethod
    def invalidate_jti(jti: str, expiration_date: datetime):
        """Store a token jti to blacklist it.

        Args:
            token (str): the token to invalidate.
            expiration_date (datetime): the token expiration timestamp.
        """

        # https://stackoverflow.com/questions/60918317/do-i-need-to-hash-refresh-token-stored-in-database

        # if the db is leaked, and the token was stored, they could reuse it.
        # if we only store the jti, they can't reuse it unless
        # the secret is also leaked, making it a tad bit harder.

        connection = sqlite3.connect(db_name)
        cursor = connection.cursor()
        # assume the max possible duration
        timestamp = generate_refresh_token_timestamp()
        cursor.execute(
            "INSERT INTO ExpiredToken (jti, expirationDate) VALUES (?,?)", (jti, timestamp)
        )
        connection.commit()
        cursor.close()
        connection.close()

    @staticmethod
    def is_jti_blacklisted(jti: str) -> bool:
        """Check if the token was invalidated.

        Args:
            jti (str): the token to check.
        """
        connection = sqlite3.connect(db_name)
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM ExpiredToken WHERE jti = ?", (jti,))
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        return result is not None

    @staticmethod
    def purge_expired_tokens():
        """Remove all expired tokens from the database."""
        connection = sqlite3.connect(db_name)
        cursor = connection.cursor()
        cursor.execute("DELETE FROM ExpiredToken WHERE expirationDate < datetime('now')")
        connection.commit()
        cursor.close()
        connection.close()


Token.purge_expired_tokens()

# %%

# %% Creating categories
sql_command = """
    SELECT w.id, w.word, c.id AS categoryId
    FROM Word w
    JOIN WordCategory wc ON w.id = wc.idWord
    JOIN Category c ON wc.idCategory = c.id
"""
cursor.execute(sql_command)
query = cursor.fetchall()
words = []
for word in query:
    if word in words:
        words[word[1]].add_category(word[2])
    else:
        w = Word(word[0], word[1])
        w.add_category(word[2])
        words.append(w)

if VERBOSE:
    for word in words:
        if len(word.category) > 1:
            word.print_word()

cursor.execute("SELECT id, name FROM Category;")
query = cursor.fetchall()
categories = [Category(*category) for category in query]

if VERBOSE:
    for category in categories:
        category.print_category()
# %%

# %% Creating words
sql_command = """
    SELECT w.id, w.word, c.id AS categoryId
    FROM Word w
    JOIN WordCategory wc ON w.id = wc.idWord
    JOIN Category c ON wc.idCategory = c.id
"""
cursor.execute(sql_command)
query = cursor.fetchall()
# The dictionnary is used to check if we have already registered a word
words_dict = {}
words: list[Word] = []
for word in query:
    word_key = (word[0], word[1])
    if word_key in words_dict:
        words_dict[word_key].add_category(word[2])
    else:
        w = Word(word[0], word[1])
        w.add_category(word[2])
        words_dict[word_key] = w
        words.append(w)

if VERBOSE:
    for word in words:
        if len(word.category) > 1:
            word.print_word()

# %%

# %% Creating Cards
cursor.execute("SELECT id, name, effect, rarity, isNegative, adding, multiplyBy FROM Card;")
query = cursor.fetchall()
cards = [Card(*card) for card in query]

if VERBOSE:
    for card in cards:
        card.print_card()
# %%

connection.commit()
connection.close()


def get_random_word_list(categories=[], amount=300):
    # return all if not enough words
    if amount > len(words):
        return [word.get_word() for word in words]

    words_copy: list[Word] = []

    # filter by category if needed
    if len(categories) == 0:
        words_copy = words.copy()
    else:
        for word in words:
            if any(word.word_in_category(category) for category in categories):
                words_copy.append(word)

    # shuffle
    random.shuffle(words_copy)

    return [word.get_word().lower() for word in words_copy[:amount]]
