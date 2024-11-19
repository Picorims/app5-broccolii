# -*- coding: utf-8 -*-
import sqlite3
import bcrypt
import os




db_name = "broccolii.db"
if os.path.exists(db_name):
    os.remove(db_name)
    print(f"The {db_name} file was successfully deleted.")
else:
    print(f"The {db_name} file doesn't exist.")

connection = sqlite3.connect(db_name)

cursor = connection.cursor()
print("Connected to the database")

sql_command = """
    CREATE TABLE Word(
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       word VARCHAR(50) NOT NULL,
       UNIQUE(word)
    );
"""
cursor.execute(sql_command)
sql_command = """
    CREATE TABLE Category(
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name VARCHAR(50) NOT NULL,
       UNIQUE(name)
    );
"""
cursor.execute(sql_command)
    
sql_command = """
    CREATE TABLE Account(
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       broccolis INT DEFAULT 0,
       username VARCHAR(50) NOT NULL,
       password VARCHAR(256) NOT NULL,
       UNIQUE(username)
    );
"""
cursor.execute(sql_command)
    
sql_command = """
    CREATE TABLE Upgrade(
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name VARCHAR(50) NOT NULL,
       effect TEXT NOT NULL,
       price INT DEFAULT 50,
       multiplyingBy DECIMAL(10,3) DEFAULT 1,
       adding INT DEFAULT 0,
       UNIQUE(name)
    );
"""
cursor.execute(sql_command)
    
sql_command = """
    CREATE TABLE WordCategory(
       idWord INT,
       idCategory INT,
       PRIMARY KEY(idWord, idCategory),
       FOREIGN KEY(idWord) REFERENCES Word(id),
       FOREIGN KEY(idCategory) REFERENCES Category(id)
    );
"""
cursor.execute(sql_command)
    
sql_command = """
    CREATE TABLE AccountUpgrade(
       idAccount INT,
       idUpgrade INT,
       Number_Owned INT NOT NULL,
       PRIMARY KEY(idAccount, idUpgrade),
       FOREIGN KEY(idAccount) REFERENCES Account(id),
       FOREIGN KEY(idUpgrade) REFERENCES Upgrade(id)
    );
"""
cursor.execute(sql_command)

#insertion
passwordA = bcrypt.hashpw('pwdAlettuce'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
passwordB = bcrypt.hashpw('pwdBrocolivier'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
passwordC = bcrypt.hashpw('pwdPicorims'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
passwordD = bcrypt.hashpw('pwdAr-No'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
passwordE = bcrypt.hashpw('pwdMaximator'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
cursor.execute("INSERT INTO Account (username, password) VALUES ('Alettuce', ?)", (passwordA,))
cursor.execute("INSERT INTO Account (username, password) VALUES ('Brocolivier', ?)", (passwordB,))
cursor.execute("INSERT INTO Account (username, password) VALUES ('Picorims', ?)", (passwordC,))
cursor.execute("INSERT INTO Account (username, password) VALUES ('Ar-No', ?)", (passwordD,))
cursor.execute("INSERT INTO Account (username, password) VALUES ('Maximator', ?)", (passwordE,))

cursor.execute("SELECT id, username FROM Account;")
accounts = cursor.fetchall()
print("Accounts in the database:")
for account in accounts:
    print(f"ID: {account[0]}, Username: {account[1]}")

# Creating Category
categories = ["Agriculture", "Green", "Bwords"]
for category in categories:
    cursor.execute("INSERT OR IGNORE INTO Category (name) VALUES (?);", (category,))

#%% Word list for each categories
agriculture = ["carrot", "potato", "rice", "tomato", "cabbage", "tractor", "wheat", "corn", "lettuce", 
          "cucumber", "irrigation", "plow", "soybean", "fertilizer", "compost", "mulch", "barley", 
          "oats", "pesticide", "greenhouse", "broccoli", "spinach", "radish", "parsley", "zucchini", 
          "herbicide", "orchard", "vineyard", "pumpkin", "beans", "eggplant", "manure", "greenhouse", 
          "turnip", "kale", "leeks", "onions", "garlic", "beet", "pepper", "celery", "squash", 
          "nursery", "farm", "harvest", "soil", "nitrogen", "phosphorus", "potassium", "ph", "drainage", 
          "crop", "rotation", "climate", "pest", "control", "organic", "sustainable", "yield", 
          "aquaponics", "aeroponics", "permaculture", "pollination", "seedling", "transplanting", 
          "trellis", "cover", "crops", "biodiversity", "food", "security", "tillage", "erosion", 
          "nutrients", "photosynthesis", "propagation", "pruning", "germination", "carbon", 
          "seasonality", "biodiversity", "greenhouse", "gas", "root", "foliage", "stem", "flower", 
          "fertilizer", "biodiversity", "polyculture", "monoculture", "biodiversity", "vermiculture", 
          "irrigation", "pest", "shovel", "hoe", "rake", "barn", "silo", "drip", "irrigation", "seed", 
          "planter", "threshing", "pruning", "apiary", "apiculture", "beekeeping", "cow", "livestock", 
          "poultry", "fodder", "silage", "greenhouse", "alfalfa", "clover", "rye", "sorghum", "millet", 
          "peanut", "sunflower", "sesame", "safflower", "flax", "hemp", "millet", "ryegrass", 
          "buckwheat", "sorrel", "amaranth", "artichoke", "asparagus", "basil", "chives", "rosemary", 
          "thyme", "sage", "oregano", "mint", "coriander", "dill", "fennel", "arugula", "endive", 
          "escarole", "mustard", "greens", "collard", "greens", "chard", "rhubarb", "fennel", "marigold", 
          "lavender", "eucalyptus", "willow", "poplar", "spruce", "fir", "pine", "maple", "chestnut", 
          "almond", "walnut", "pecan", "hazelnut", "chestnut", "fig", "date", "olive", "apple", "pear", 
          "plum", "cherry", "apricot", "nectarine", "quince", "persimmon", "pomegranate", "kiwi", "mango", 
          "avocado", "banana", "citrus", "lemon", "lime", "orange", "grapefruit", "mandarin", "cranberry", 
          "blueberry", "blackberry", "raspberry", "strawberry", "melon", "watermelon", "cantaloupe", 
          "honeydew", "grape", "coconut", "pineapple", "papaya", "guava", "lychee", "passion", "fruit", 
          "acerola", "loquat", "elderberry", "gooseberry", "currant", "jujube", "sapodilla", "tamarind", 
          "rambutan", "mangosteen", "durian", "jackfruit", "longan", "breadfruit", "cacao", "coffee", 
          "tea", "sugarcane", "jute", "cotton", "tobacco", "bamboo", "hops", "mushroom", "truffle", 
          "shiitake", "oyster", "mushroom", "enoki", "mane", "moringa", "kelp", "seaweed", "spirulina", 
          "quinoa", "chia", "cassava", "yucca", "okra", "chickpea", "lentil", "fava", "bean", "mung", 
          "bean", "pigeon", "pea", "lima", "bean", "lupin", "black-eyed", "pea", "adzuki", "bean", 
          "sorrel", "nettle", "purslane", "malabar", "spinach", "luffa", "bottle", "gourd", "winter", 
          "melon", "bitter", "melon", "ivy", "gourd", "snake", "gourd", "chayote", "yardlong", "bean", 
          "winged", "bean", "amaranth", "quinoa", "buckwheat", "sorghum", "safflower", "sesame", "basil", 
          "peppermint", "oregano", "tarragon", "anise", "coriander", "chamomile", "hibiscus", "stevia", 
          "lemongrass", "hops", "ginger", "turmeric", "galangal", "horseradish", "saffron", "valerian", 
          "echinacea", "dandelion", "burdock", "milk", "thistle", "alfalfa", "hemp", "kenaf", "borage", 
          "lavender", "ginseng", "kava", "neem", "basil", "rosemary", "marjoram", "lemongrass", "cardamom", 
          "fennel", "cumin", "fenugreek", "garlic", "chives", "bay", "laurel", "epazote", "hyssop", "borage", 
          "borage", "caraway", "lovage", "savory", "sorrel", "stevia", "saffron", "tarragon", "wormwood", 
          "yarrow", "zinnia", "columbine", "snapdragon", "pansy", "sunflower", "zinnia", "cosmos", 
          "amaryllis", "begonia", "petunia", "foxglove", "daisy", "dahlia", "lily", "tulip", "daffodil", 
          "crocus", "rose", "iris", "peony", "hydrangea", "rhododendron", "azalea", "hibiscus", "jasmine", 
          "magnolia", "gardenia", "fuchsia", "bougainvillea", "honeysuckle", "wisteria", "clematis", 
          "begonia", "geranium", "chrysanthemum", "carnation", "nasturtium", "sweet", "pea", "orchid", 
          "poinsettia", "vinca", "impatiens", "verbena", "lantana", "salvia", "lobelia", "alyssum", 
          "gazania", "sedum", "aster", "echinacea", "hosta", "delphinium", "agapanthus", "celosia", 
          "scabiosa", "phlox", "heliotrope", "nicotiana", "datura", "brugmansia", "belladonna", "foxglove", 
          "coltsfoot", "poppy", "mandrake", "clover", "ginseng", "wild", "ginger", "lady's", "slipper", 
          "bloodroot", "mayapple", "ramps", "milkweed", "spicebush", "trillium", "black", "cohosh", "blue", 
          "cohosh", "wild", "yam", "solomon's", "seal", "joe-pye", "weed", "boneset", "snakeroot", 
          "skullcap", "burdock", "dandelion", "echinacea", "sage", "tobacco"]

green = ["grass", "moss", "fern", "algae", "spinach", "lettuce", "kale", "chard", "parsley", "basil",
         "mint", "thyme", "oregano", "rosemary", "sage", "cilantro", "dill", "arugula", "seaweed",
         "bamboo", "cactus", "pine", "tree", "cedar", "juniper", "fir", "eucalyptus", "jade plant",
         "succulent", "clover", "shamrock", "ivy", "pothos", "philodendron", "monstera", "snake",
         "fig", "maple", "birch", "grapevine", "kiwi", "lime", "avocado", "cucumber", "zucchini",
         "pepper", "jalapeño", "beans", "peas", "broccoli", "asparagus", "okra", "artichoke",
         "Brussels sprouts", "tea", "matcha", "pistachio", "wasabi", "grapes", "melon", "smoothie",
         "edamame", "chayote", "seaweed wrap", "mossy rock", "emerald", "peridot", "malachite", "agate",
         "tourmaline", "plant", "coral", "marble", "gemstone", "jewelry", "chameleon", "frog", "iguana",
         "parrot feathers", "green snake", "praying mantis", "caterpillar", "beetle", "dragonfly",
         "grasshopper", "firefly", "gecko", "turtle", "shell", "lizard", "sea turtle", "bloom",
         "lily pad", "lotus leaf", "canopy", "needles", "kelp", "rainforest", "jungle", "leaves",
         "camouflage", "army uniform", "recycling bin", "bottle", "glass jar", "sculpture", "fabric",
         "ink", "paint", "wool", "silk", "satin", "moss-covered wall", "moss mat", "tennis court", 
         "football field", "soccer field", "flag", "palm leaf", "golf course", "billiard table", 
         "traffic light", "dollar", "money", "leafy vegetables", "grasslands", "oil", "tennis ball", 
         "mint ice cream", "lime zest", "herbal tea", "pine cone", "celery", "gooseberry", "scallion", 
         "leeks", "onion", "cabbage", "collard greens", "sorrel", "bok choy", "moringa", "watercress", 
         "dandelion greens", "tatsoi", "fiddlehead fern", "romaine lettuce", "beer", "soda", "dress", 
         "scarf", "curtains", "upholstery", "aloe vera", "soap", "toothpaste", "chalk", "camo", "armor", 
         "recycling symbol", "terrarium plants", "clay", "celadon", "pottery", "ring", "velvet", "bowl", 
         "dragon", "apple", "fields", "lawn", "wall", "olive", "forest", "log", "canyon", "pond", 
         "lichen", "pesto", "tarragon", "vine", "cardamom", "agave", "wormwood", "hemlock"]

b_words = ["bamboo", "basil", "beet", "broccoli", "blueberry", "blackberry", "barley", "banana", 
        "bean", "berry", "birch", "beetroot", "bell", "barn", "basket", "bale", "barnyard", 
        "beekeeper", "beehive", "bud", "breeze", "blackbird", "briar", "badger", "buffalo", 
        "bloom", "brook", "bog", "borage", "buckwheat", "bedrock", "barnacle", "buff", "blade", 
        "bushland", "bumblebee", "burrow", "bobcat", "banyan", "burdock", "bloodroot", "baobab", 
        "buttercup", "bluebell", "buckthorn", "bilberry", "bullfrog", "bowfin", "bullhead", 
        "bogbean", "barberry", "bulrush", "bat", "bass", "broom", "bluegill", "boxwood", 
        "buttonbush", "bushbaby", "bloodhound", "brindle", "bobolink", "bigeye", "bellflower", 
        "bittersweet", "bluebird", "backwater", "birchwood", "butter", "balsam", "barge", 
        "basilica", "basin", "bassinet", "bayou", "beagle", "beaker", "beam", "beanpole", 
        "beech", "beginner", "beige", "belladonna", "bellows", "beluga", "benzoin", "bergamot", 
        "berrybush", "berserk", "beryl", "beta", "betony", "biceps", "bighorn", "bight", "bigleaf", 
        "bilge", "billy", "bindi", "bindweed", "biome", "birdbath", "birdhouse", "bittercress", 
        "bittern", "blackfish", "blackfly", "blackroot", "blackthorn", "bladder", "bladegrass", 
        "blanketflower", "blaze", "blewit", "blimp", "blink", "bliss", "blob", "bloodleaf", 
        "bloomers", "blowhole", "blowout", "bluefish", "bluegrass", "blueweed", "bluet", "bluff", 
        "blur", "boa", "boar", "boatman", "bobbin", "bogwood", "boiling", "bole", "boll", "bolete", 
        "bolide", "bonnet", "bonsai", "booby", "boom", "bootlace", "borax", "border", "borer", 
        "bottlebrush", "bottlenose", "bouquet", "bower", "bowhead", "box", "boxfish", "bramble", 
        "branchlet", "brand", "brassica", "bristle", "brittle", "broadleaf", "bromeliad", "brooklet", 
        "broomrape", "brownback", "brush", "bubble", "buckbean", "buckeye", "buckler", "bugbane", 
        "bulb", "bulbil", "bullace", "bullrush", "bumble", "bunchberry", "bund", "bur", "burclover", 
        "burlap", "burley", "burnet", "burro", "bursage", "bushbuck", "bustard", "butternut", 
        "buzzard", "byproduct", "braid", "briquette", "boar", "barracuda", "bluestem", "balsa", "bole", 
        "blight", "bursary", "burly", "blush", "buoy", "brimstone", "barleycorn", "byway", "bugle", 
        "burbot", "bivalve", "ballista", "bracken", "blackcap", "burble", "bellwort", "bloodfin", 
        "butterwort", "bluefin", "bryophyte", "bignonia", "bauble", "bigtooth", "budgie", "bluebonnet", 
        "bluestone", "buckaroo", "bluebush", "barrow", "bighead", "butterbur", "basilisk", "bristlecone", 
        "blackjack", "bisonberry", "bogland", "brick", "buttonwood", "blufftop", "bronzewing", 
        "briquette", "bluestone", "buckthorn", "brachiopod", "burrower", "bedouin", "blueblossom", 
        "burhinus", "bluejay", "basidium", "bitternut", "barnowl", "bloomfield", "brontide", "bursera", 
        "bryony", "bellbird", "bittersweet", "bladderwort", "barberry", "basswood", "bristleworm", 
        "bighorn", "bloodstone", "bitterweed", "burhead", "bluebottle", "bellwort", "bitterwood", 
        "brome", "bullace", "brontosaurus", "binturong", "bromine", "broomtail", "bayberry", "burmannia", 
        "biddy", "bogbank", "bulldog", "blowball", "bindweed", "birdwing", "buzzcut", "boatload", 
        "brushwood", "backcross", "brushpile", "burlwood", "brindled", "bisonette", "bladderstone", 
        "bilberry", "bluebell", "bushmaster", "bellflower", "bloodberry", "bluegrape", "barrow", 
        "bittern", "briarwood", "burbot", "barnacle", "bellwort", "bettong", "belvedere", "bluebush", 
        "blowhole", "bubblewort", "brae", "bushtit", "bogbean", "balloonflower", "boatbill", "breezeway", 
        "bandicoot", "burgrass", "bedstraw", "bluebottle", "birdwood", "bellbird", "bloodroot", 
        "buzzwort", "bugleweed", "bagworm", "brimrose", "blackfoot", "burrfish", "blisterpod", 
        "burrito", "banyan", "bugbane", "barklice", "bubblefish", "butcherbird", "butterfish", "buzzkill", 
        "bloodline", "bobolink", "bumbler", "beebalm", "bayonet", "balata", "bracken", "bogey", "barrens", 
        "barbet", "bushtree", "brownwort", "bloodhound", "buttonweed", "broadcast", "bee", "bikini"
]
#%%

words = {
    "Agriculture": agriculture,
    "Green": green,
    "Bwords": b_words,
}

#Inserting words in Word
for category_name, word_list in words.items():
    for word in word_list:
        cursor.execute("INSERT OR IGNORE INTO Word (word) VALUES (?);", (word,))

# Linking words to their categories (inserting in WordCategory)
for category_name in words:
    cursor.execute("SELECT id FROM Category WHERE name = ?;", (category_name,))
    category_id = cursor.fetchone()[0]
    cursor.execute("SELECT id FROM Word WHERE word IN ({})".format(','.join(['?']*len(words[category_name]))), tuple(words[category_name]))
    word_ids = cursor.fetchall()
    
    for word_id in word_ids:
        cursor.execute("INSERT OR IGNORE INTO WordCategory (idWord, idCategory) VALUES (?, ?);", (word_id[0], category_id))

#%% Word & Category insert's verification
sql_command = """
    WITH RankedWords AS (
        SELECT w.id, w.word, c.name AS category_name, 
               ROW_NUMBER() OVER (PARTITION BY c.name ORDER BY w.id) AS row_num
        FROM Word w
        JOIN WordCategory wc ON w.id = wc.idWord
        JOIN Category c ON wc.idCategory = c.id
    )
    SELECT word, category_name
    FROM RankedWords
    WHERE row_num <= 20
    ORDER BY category_name, row_num;
"""

cursor.execute(sql_command)
results = cursor.fetchall()
for result in results:
    print(f"{result[1]}: {result[0]}, ")
#%%


connection.close()
print("Database setup complete.")