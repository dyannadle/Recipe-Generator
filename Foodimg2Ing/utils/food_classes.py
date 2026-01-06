
# ImageNet classes that are food/edible
# Ranges are approximate based on standard ImageNet 1000 class list
FOOD_CLASSES = set()

# Add ranges for food-related ImageNet classes
# 923-969 are largely food dishes
for i in range(923, 969 + 1):
    FOOD_CLASSES.add(i)

# Fruits and vegetables (approximate ranges)
# 948-957 (apples, etc - overlap with above?) -> Let's be specific
# Using specific indices for common foods found in ImageNet
# Source: standard ImageNet class index mapping
SPECIFIC_FOOD_INDICES = [
    # Fruits
    948, 949, 950, 951, 952, 953, 954, 955, 956, 957, # Apples, strawberries, etc.
    958, 959, 987, 988, 989, 990, # Corn, misc
    # Vegetables
    936, 937, 938, # Broccoli, cabbage, etc.
    # Prepared food
    923, 924, 925, 926, 927, 928, 929, 930, 931, 932, 933, 934, 935, # Plates, consomme, etc.
    959, 960, 961, 962, 963, 964, 965, # Carbonara, etc.
    # Drinks
    966, 967, 968, 969, # Coffees, espresso
    # Misc
    500, # water bottle
    760, # popsicle
    400, # academic gown? No.
    # Let's trust a broader range for "kitchen/food" context if strictness is key
]

# Better approach: A comprehensive set of food indices.
# 923: 'plate', 924: 'guacamole', 925: 'consomme', 926: 'hot pot', 927: 'trifle', 928: 'ice cream', 929: 'ice lolly', 930: 'French loaf', 931: 'bagel', 932: 'pretzel', 933: 'cheeseburger', 934: 'hotdog', 935: 'mashed potato', 936: 'head cabbage', 937: 'broccoli', 938: 'cauliflower', 939: 'zucchini', 940: 'spaghetti squash', 941: 'acorn squash', 942: 'butternut squash', 943: 'cucumber', 944: 'artichoke', 945: 'bell pepper', 946: 'cardoon', 947: 'mushroom', 948: 'Granny Smith', 949: 'strawberry', 950: 'orange', 951: 'lemon', 952: 'fig', 953: 'pineapple', 954: 'banana', 955: 'jackfruit', 956: 'custard apple', 957: 'pomegranate', 958: 'hay', 959: 'carbonara', 960: 'chocolate sauce', 961: 'dough', 962: 'meat loaf', 963: 'pizza', 964: 'potpie', 965: 'burrito', 966: 'red wine', 967: 'espresso', 968: 'cup', 969: 'eggnog', 
# 970: 'alp', 971: 'bubble', 972: 'cliff', 973: 'coral reef' ... (Nature)

# Fruits/Veg ranges earlier in the list?
# 496: 'bottle cap' ...
# 503: 'cocktail shaker', 504: 'coffee mug', 505: 'coffeepot' -> Related but not food
# 723: 'pinwheel'
# 440-450?

final_food_indices = list(range(924, 969 + 1)) # Exclude 923 (plate)
# Remove specific non-food items within this range if necessary
# 968 is cup, 958 is hay.
if 968 in final_food_indices: final_food_indices.remove(968)
if 958 in final_food_indices: final_food_indices.remove(958)

def is_food_index(idx):
    return idx in final_food_indices


