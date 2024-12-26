import sqlite3


db_name = "broccolii.db"
connection = sqlite3.connect(db_name)
cursor = connection.cursor()

req4 = "SELECT * from AccountCard"
cursor.execute(req4)
print("fin :", cursor.fetchall())
