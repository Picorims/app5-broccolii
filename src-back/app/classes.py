# -*- coding: utf-8 -*-
import sqlite3
import bcrypt


db_name = "broccolii.db"
connection = sqlite3.connect(db_name)
cursor = connection.cursor()
print("Connected to the database")


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

    def get_word(self):
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


class Account:
    def __init__(self, id, broccolis, username, cards):
        self.id = id
        self.broccolis = broccolis
        self.username = username
        self.cards = cards

    def add_card(self, card):
        self.cards.append([card, 0])
        cursor.execute(f"INSERT INTO AccountCard VALUES ({self.id}, {card.id}, 0)")

    def equip_card(self, card):
        self.cards = [[c, 1] if c == card else [c, v] for c, v in self.cards]
        cursor.execute(
            f"UPDATE TABLE AccountCard SET isEquipped = 1 WHERE idAccount = {self.id}\n"
            f"AND idCard = {card.id})"
        )

    def unequip_card(self, card):
        self.cards = [[c, 1] if c == card else [c, v] for c, v in self.cards]
        cursor.execute(
            f"UPDATE TABLE AccountCard SET isEquipped = 0 WHERE idAccount = {self.id}\n"
            f"AND idCard = {card.id})"
        )

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

for word in words:
    if len(word.category) > 1:
        word.print_word()

cursor.execute("SELECT id, name FROM Category;")
query = cursor.fetchall()
categories = [Category(*category) for category in query]

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
words = []
for word in query:
    word_key = (word[0], word[1])
    if word_key in words_dict:
        words_dict[word_key].add_category(word[2])
    else:
        w = Word(word[0], word[1])
        w.add_category(word[2])
        words_dict[word_key] = w
        words.append(w)

for word in words:
    if len(word.category) > 1:
        word.print_word()

# %%

# %% Creating Cards
cursor.execute("SELECT id, name, effect, rarity, isNegative, adding, multiplyBy FROM Card;")
query = cursor.fetchall()
cards = [Card(*card) for card in query]

for card in cards:
    card.print_card()
# %%

connection.commit()
connection.close()
