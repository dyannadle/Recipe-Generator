import re

# Simple heuristic database for nutrition (per 100g estimate)
# Format: 'keyword': {'calories': int, 'protein': int, 'carbs': int, 'fat': int}
INGREDIENT_DATABASE = {
    'chicken': {'calories': 165, 'protein': 31, 'carbs': 0, 'fat': 3.6},
    'beef': {'calories': 250, 'protein': 26, 'carbs': 0, 'fat': 17},
    'pork': {'calories': 242, 'protein': 27, 'carbs': 0, 'fat': 14},
    'fish': {'calories': 206, 'protein': 22, 'carbs': 0, 'fat': 12},
    'egg': {'calories': 155, 'protein': 13, 'carbs': 1.1, 'fat': 11},
    'rice': {'calories': 130, 'protein': 2.7, 'carbs': 28, 'fat': 0.3},
    'pasta': {'calories': 131, 'protein': 5, 'carbs': 25, 'fat': 1.1},
    'bread': {'calories': 265, 'protein': 9, 'carbs': 49, 'fat': 3.2},
    'potato': {'calories': 77, 'protein': 2, 'carbs': 17, 'fat': 0.1},
    'onion': {'calories': 40, 'protein': 1.1, 'carbs': 9, 'fat': 0.1},
    'garlic': {'calories': 149, 'protein': 6.4, 'carbs': 33, 'fat': 0.5},
    'tomato': {'calories': 18, 'protein': 0.9, 'carbs': 3.9, 'fat': 0.2},
    'carrot': {'calories': 41, 'protein': 0.9, 'carbs': 9.6, 'fat': 0.2},
    'pepper': {'calories': 20, 'protein': 0.9, 'carbs': 4.6, 'fat': 0.2},
    'broccoli': {'calories': 34, 'protein': 2.8, 'carbs': 6.6, 'fat': 0.4},
    'spinach': {'calories': 23, 'protein': 2.9, 'carbs': 3.6, 'fat': 0.4},
    'oil': {'calories': 884, 'protein': 0, 'carbs': 0, 'fat': 100},
    'butter': {'calories': 717, 'protein': 0.9, 'carbs': 0.1, 'fat': 81},
    'cheese': {'calories': 402, 'protein': 25, 'carbs': 1.3, 'fat': 33},
    'milk': {'calories': 42, 'protein': 3.4, 'carbs': 5, 'fat': 1},
    'cream': {'calories': 195, 'protein': 2.7, 'carbs': 3.7, 'fat': 19},
    'sugar': {'calories': 387, 'protein': 0, 'carbs': 100, 'fat': 0},
    'flour': {'calories': 364, 'protein': 10, 'carbs': 76, 'fat': 1},
}

def estimate_nutrition(ingredients):
    """
    Estimate nutrition for a list of ingredients.
    This is a rough heuristic. In a real app, we'd use an NLP model
    to parse potential quantities and map to a real database.
    
    Args:
        ingredients (list): List of ingredient strings
        
    Returns:
        dict: Nutritional values
    """
    total_nutrition = {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0}
    
    # Assume distinct ingredients contribute roughly 100g worth of value 
    # (very rough update, but sufficient for mockup)
    # or better, just sum up identified items.
    
    item_count = 0
    
    for item in ingredients:
        item_lower = item.lower()
        found = False
        for key, values in INGREDIENT_DATABASE.items():
            if key in item_lower:
                total_nutrition['calories'] += values['calories']
                total_nutrition['protein'] += values['protein']
                total_nutrition['carbs'] += values['carbs']
                total_nutrition['fat'] += values['fat']
                found = True
                break # Only match one keyword per ingredient string
        
        if found:
            item_count += 1
            
    # Normalize? No, let's just return the sum. 
    # Logic: if we found 5 ingredients, we sum them up.
    # It might overestimate for spices (caught by "pepper"?) or underestimate for quantities.
    # Let's add a base value if nothing found to avoid 0s.
    
    if total_nutrition['calories'] == 0:
        # Default fallback for unknown meals
        return {
            'calories': 450,
            'protein': 20, 
            'carbs': 50,
            'fat': 15
        }
        
    return {k: round(v) for k, v in total_nutrition.items()}
