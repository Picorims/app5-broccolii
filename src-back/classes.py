# -*- coding: utf-8 -*-
import sqlite3


db_name = "broccolii.db"
connection = sqlite3.connect(db_name)
cursor = connection.cursor()
print("Connected to the database")


class Category:
    def __init__(self, id, name):
        self.id = id
        self.name = name.capitalize()

    def PrintCategory(self):
        print(f"{self.id}: {self.name}")


class Word:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.category = []

    def GetWord(self):
        return self.name.capitalize()

    def AddCategory(self, categoryId):
        categoryName = cursor.execute(
            f"SELECT name FROM Category WHERE id = {categoryId}"
        ).fetchone()[0]
        self.category.append(Category(categoryId, categoryName))

    def WordInCategory(self, category):
        return category in self.category

    def PrintCategory(self):
        for i in self.category:
            i.PrintCategory()

    def PrintWord(self):
        print(f" {self.GetWord()}")
        self.PrintCategory()

    def RemoveCategory(self, category):
        if self.WordInCategory(category):
            self.category.remove(category)


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
        words[word[1]].AddCategory(word[2])
    else:
        w = Word(word[0], word[1])
        w.AddCategory(word[2])
        words.append(w)

for word in words:
    if len(word.category) > 1:
        word.PrintWord()


cursor.execute("SELECT id, name FROM Category;")
query = cursor.fetchall()
categories = [Category(*category) for category in query]

for category in categories:
    category.PrintCategory()


class Card:
    def __init__(self, id, name, effect, rarity, isNegative, adding, multiplyBy):
        self.id = id
        self.name = name.capitalize()
        self.effect = effect
        self.rarity = rarity
        self.isNegative = isNegative
        self.adding = adding
        self.multiplyBy = multiplyBy

    def PrintCard(self):
        negative = "Negative " if self.isNegative else ""
        print(f"{self.id}: {negative}{self.name} - {self.rarity}")
        print(f" {self.effect}")
        print(f" Adds: {self.adding} - Multiplies by: {self.multiplyBy}")


cursor.execute("SELECT id, name, effect, rarity, isNegative, adding, multiplyBy FROM Card;")
query = cursor.fetchall()
cards = [Card(*card) for card in query]

for card in cards:
    card.PrintCard()


class Account:
    def __init__(self, id, broccolis, username, upgrades):
        self.id = id
        self.broccolis = broccolis
        self.username = username
        self.upgrades = upgrades


connection.close()
