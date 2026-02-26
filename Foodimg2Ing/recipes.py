# PURPOSE: Documentation header clarifying the scope of this module.
# WHY: Helps developers quickly identify that this file contains the logic for creating and viewing recipes.
# IMPACT: Improves codebase navigability.
"""
Recipe Management Routes
This file handles all recipe-related operations: saving, retrieving, deleting, and favoriting recipes.
"""

# PURPOSE: Import Flask utilities for handling JSON data and incoming requests.
# WHY: 'jsonify' creates JSON responses; 'request' accesses POST data/URL args.
# ALTERNATIVE: Use raw 'Response' objects, but 'jsonify' sets the correct 'application/json' MIME type automatically.
# IMPACT: Allows the API to communicate with the React frontend.
from flask import jsonify, request
import os
import json
from werkzeug.utils import secure_filename

# PURPOSE: Import the Flask app and rate limiter from the central package.
# WHY: '@app.route' registers endpoints; '@limiter' prevents API abuse like automated recipe scraping.
# IMPACT: Integrates this module with the application's routing and security layers.
from Foodimg2Ing import app, limiter

# PURPOSE: Import data models for database operations.
# WHY: 'db' is the database session; 'Recipe', 'Favorite', 'Rating' are the tables we interact with.
# IMPACT: Enables CRUD (Create, Read, Update, Delete) operations on recipe data.
from Foodimg2Ing.models import db, Recipe, Favorite, Rating

# PURPOSE: Import security decorators.
# WHY: 'token_required' forces a login; 'optional_token' allows public view but identifies the user if they're logged in.
# ALTERNATIVE: Manual JWT checking inside functions, but decorators are much DRYer (Don't Repeat Yourself).
# IMPACT: Protects user data and enables personalized features (like 'favoriting').
from Foodimg2Ing.utils.security import token_required, optional_token

# PURPOSE: Import SQLAlchemy sorting helper.
# WHY: 'desc' is used to show the most recent recipes first.
# IMPACT: Directly affects the UI layout and sorting logic.
from sqlalchemy import desc

# ============================================================================
# SAVE RECIPE ENDPOINT
# ============================================================================
# PURPOSE: Route to save a generated recipe to the user's account.
# WHY: Users want to keep recipes they like for future reference.
# IMPACT: Creates a permanent record in the 'recipes' table.
@app.route('/api/recipes/save', methods=['POST'])
# PURPOSE: Enforce authentication.
# WHY: You can't save a recipe to a specific account if the user isn't identified.
@token_required  
# PURPOSE: Limit recipe saving to 20 per hour.
# WHY: Prevents a malicious user or bot from bloating the database with millions of fake recipes.
# IMPACT: Protects server resources and database storage.
@limiter.limit("20 per hour")  
def save_recipe(user):
    """
    Save a generated recipe to the database
    """
    
    # PURPOSE: Extract the JSON payload from the request.
    # WHY: The frontend sends recipe data (title, ingredients) in the body of a POST.
    data = request.get_json()
    
    # PURPOSE: Validate input data.
    # WHY: Prevents 'None' errors or empty recipes from being saved.
    # IMPACT: Ensures database integrity.
    if not data or not data.get('title') or not data.get('ingredients'):
        return jsonify({'error': 'Title and ingredients are required'}), 400
    
    try:
        # PURPOSE: Create a new Recipe model instance.
        # WHY: To prepare the user-provided data for database insertion.
        # IMPACT: Maps the request data to the SQL schema.
        recipe = Recipe(
            user_id=user.id,  # LINK: Connects this recipe to the specific logged-in user.
            title=data['title'].strip(),  # CLEAN: Removes accidental leading/trailing spaces.
            ingredients=data['ingredients'],  # DATA: List of ingredients.
            instructions=data.get('instructions', []),  # OPTIONAL: Default to empty if none provided.
            image_url=data.get('image_url'),  # MEDIA: Path to the generated food image.
            is_public=data.get('is_public', False)  # PRIVACY: Default to private unless specified.
        )
        
        # PURPOSE: Stage the new object for addition.
        db.session.add(recipe)
        
        # PURPOSE: Commit the session to disk.
        # WHY: Database changes aren't permanent until committed.
        # IMPACT: Makes the recipe available for future retrieval.
        db.session.commit()
        
        # PURPOSE: Return the newly created recipe as JSON.
        # WHY: Frontend needs the generated ID (recipe.id) to navigate to the new recipe page.
        # IMPACT: Seamless transition from 'generating' to 'viewing saved'.
        return jsonify({
            'message': 'Recipe saved successfully',
            'recipe': recipe.to_dict()
        }), 201  # HTTP 201: Created.
    
    except Exception as e:
        # PURPOSE: Rollback if an error occurs during commit.
        # WHY: Prevents partial writes or locked database states.
        db.session.rollback()
        print(f"Error saving recipe: {e}")
        return jsonify({'error': 'Failed to save recipe'}), 500


# ============================================================================
# CREATE MANUAL RECIPE ENDPOINT
# ============================================================================
# PURPOSE: Allow users to manually upload their own recipes with unique images.
# WHY: Not all recipes come from AI; users want to store their personal traditional recipes too.
# IMPACT: Expands the platform from a "Generator" to a full "Recipe Keeper".
@app.route('/api/recipes/create', methods=['POST'])
@token_required
@limiter.limit("10 per hour")
def create_manual_recipe(user):
    """
    Manually create a recipe with an uploaded image
    """
    
    # PURPOSE: Check for mandatory text fields in the form data.
    # WHY: We use request.form instead of request.get_json() because this is a multipart request.
    title = request.form.get('title')
    ingredients_raw = request.form.get('ingredients') # Expecting JSON string
    instructions_raw = request.form.get('instructions') # Expecting JSON string
    
    if not title or not ingredients_raw:
        return jsonify({'error': 'Title and ingredients are required'}), 400
        
    try:
        # PURPOSE: Parse JSON strings from form fields.
        # WHY: Frontend sends arrays as JSON strings in multipart requests.
        ingredients = json.loads(ingredients_raw)
        instructions = json.loads(instructions_raw) if instructions_raw else []
        
        image_url = None
        
        # PURPOSE: Handle optional image upload.
        # WHY: Users might want to upload a photo of their dish.
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename != '':
                # PURPOSE: Secure the filename to prevent directory traversal attacks.
                filename = secure_filename(file.filename)
                
                # PURPOSE: Ensure the upload directory exists.
                upload_dir = os.path.join(app.root_path, 'static', 'uploads', 'recipes')
                if not os.path.exists(upload_dir):
                    os.makedirs(upload_dir)
                
                # PURPOSE: Save the file.
                file_path = os.path.join(upload_dir, filename)
                file.save(file_path)
                
                # PURPOSE: Generate the URL for the frontend.
                image_url = f"/static/uploads/recipes/{filename}"

        # PURPOSE: Save the new recipe to the database.
        recipe = Recipe(
            user_id=user.id,
            title=title.strip(),
            ingredients=ingredients,
            instructions=instructions,
            image_url=image_url,
            is_public=request.form.get('is_public', 'false').lower() == 'true'
        )
        
        db.session.add(recipe)
        db.session.commit()
        
        return jsonify({
            'message': 'Manual recipe created successfully',
            'recipe': recipe.to_dict()
        }), 201
        
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid format for ingredients or instructions'}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error creating manual recipe: {e}")
        return jsonify({'error': 'Failed to create recipe'}), 500


# ============================================================================
# GET USER'S RECIPES ENDPOINT
# ============================================================================
# PURPOSE: Fetch all recipes created by the current user.
# WHY: To populate the 'My Recipes' page in the dashboard.
# IMPACT: Shows the user their personal history of saved cooking ideas.
@app.route('/api/recipes/my-recipes', methods=['GET'])
@token_required  
def get_my_recipes(user):
    try:
        # PURPOSE: Query the database for recipes owned by this user.
        # WHY: We must filter by user_id so users don't see each other's private data.
        # IMPACT: Data privacy and multi-tenancy.
        recipes = Recipe.query.filter_by(user_id=user.id)\
                              .order_by(desc(Recipe.created_at))\
                              .all()
        
        # PURPOSE: Convert list of objects to serializable dictionaries.
        # WHY: Recipe objects aren't directly JSON-serializable.
        # IMPACT: Prepares the data for HTTP transmission.
        recipes_data = [recipe.to_dict() for recipe in recipes]
        
        return jsonify({
            'recipes': recipes_data,
            'count': len(recipes_data)  # CONVENIENCE: Useful for UI 'Total: 5' badges.
        }), 200
    
    except Exception as e:
        print(f"Error fetching recipes: {e}")
        return jsonify({'error': 'Failed to fetch recipes'}), 500


# ============================================================================
# GET SINGLE RECIPE ENDPOINT
# ============================================================================
# PURPOSE: Fetch a specific recipe by ID.
# WHY: For the detailed view page where a user reads instructions.
# IMPACT: Primary viewing path for individual recipes.
@app.route('/api/recipes/<int:recipe_id>', methods=['GET'])
# PURPOSE: Use optional token.
# WHY: Allows public recipes to be shared via link with non-logged-in users.
@optional_token  
def get_recipe(user, recipe_id):
    # PURPOSE: Fetch recipe by primary key.
    # WHY: Standard retrieval.
    recipe = db.session.get(Recipe, recipe_id)
    
    # PURPOSE: Handle missing recipes.
    # WHY: Prevents null pointer errors.
    if not recipe:
        return jsonify({'error': 'Recipe not found'}), 404
    
    # PURPOSE: Security check for private recipes.
    # WHY: If a recipe is not marked public, ONLY the owner should see it.
    # IMPACT: Prevents unauthorized snooping via URL guessing.
    is_owner = user and recipe.user_id == user.id
    if not is_owner and not recipe.is_public:
        return jsonify({'error': 'Access denied'}), 403
    
    # PURPOSE: Return recipe data.
    # WHY: 'include_user=True' shows the creator's username on the page.
    return jsonify({
        'recipe': recipe.to_dict(include_user=True)
    }), 200


# ============================================================================
# DELETE RECIPE ENDPOINT
# ============================================================================
# PURPOSE: Remove a recipe from the database.
# WHY: Users want to delete old or unwanted recipes.
# IMPACT: Permanently removes data from storage.
@app.route('/api/recipes/<int:recipe_id>', methods=['DELETE'])
@token_required  
def delete_recipe(user, recipe_id):
    recipe = db.session.get(Recipe, recipe_id)
    
    if not recipe:
        return jsonify({'error': 'Recipe not found'}), 404
    
    # PURPOSE: Verify ownership before deletion.
    # WHY: Crucial security! Only the owner can delete their own records.
    # IMPACT: Prevents malicious data loss.
    if recipe.user_id != user.id:
        return jsonify({'error': 'You can only delete your own recipes'}), 403
    
    try:
        # PURPOSE: Remove the record.
        # WHY: Database cleanup.
        db.session.delete(recipe)
        db.session.commit()
        
        return jsonify({'message': 'Recipe deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting recipe: {e}")
        return jsonify({'error': 'Failed to delete recipe'}), 500


# ============================================================================
# FAVORITE/UNFAVORITE RECIPE ENDPOINT
# ============================================================================
# PURPOSE: Toggle a recipe as a favorite.
# WHY: A secondary way to 'Save' shared/public recipes to a dedicated list.
@app.route('/api/recipes/<int:recipe_id>/favorite', methods=['POST', 'DELETE'])
@token_required  
def toggle_favorite(user, recipe_id):
    recipe = db.session.get(Recipe, recipe_id)
    if not recipe:
        return jsonify({'error': 'Recipe not found'}), 404
    
    # PURPOSE: Check if a favorite already exists for this pair.
    # WHY: Logic depends on whether we are adding or removing.
    existing_favorite = Favorite.query.filter_by(
        user_id=user.id,
        recipe_id=recipe_id
    ).first()  
    
    try:
        if request.method == 'POST':
            # PURPOSE: Handle 'Add Favorite'.
            if existing_favorite:
                return jsonify({
                    'message': 'Recipe already in favorites',
                    'is_favorited': True
                }), 200
            
            # PURPOSE: Create link between User and Recipe.
            favorite = Favorite(
                user_id=user.id,
                recipe_id=recipe_id
            )
            
            db.session.add(favorite)
            db.session.commit()
            
            return jsonify({
                'message': 'Recipe added to favorites',
                'is_favorited': True
            }), 201
        
        else:  # DELETE method
            # PURPOSE: Handle 'Remove Favorite'.
            if not existing_favorite:
                return jsonify({
                    'message': 'Recipe not in favorites',
                    'is_favorited': False
                }), 200
            
            db.session.delete(existing_favorite)
            db.session.commit()
            
            return jsonify({
                'message': 'Recipe removed from favorites',
                'is_favorited': False
            }), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Error toggling favorite: {e}")
        return jsonify({'error': 'Failed to update favorites'}), 500


# ============================================================================
# GET USER'S FAVORITES ENDPOINT
# ============================================================================
# PURPOSE: Fetch all recipes marked as favorites by the user.
# WHY: To populate the 'Favorites' tab on the site.
@app.route('/api/recipes/favorites', methods=['GET'])
@token_required
def get_favorites(user):
    try:
        # PURPOSE: Lookup user's favorite records.
        # IMPACT: Gathers the IDs of all favorited recipes.
        favorites = Favorite.query.filter_by(user_id=user.id)\
                                  .order_by(desc(Favorite.created_at))\
                                  .all()
        
        # PURPOSE: Return full recipe data for each favorite.
        # WHY: UI needs more than just the IDs to display a list.
        favorites_data = [favorite.to_dict() for favorite in favorites]
        
        return jsonify({
            'favorites': favorites_data,
            'count': len(favorites_data)
        }), 200
    
    except Exception as e:
        print(f"Error fetching favorites: {e}")
        return jsonify({'error': 'Failed to fetch favorites'}), 500

# ============================================================================
# GET RECIPE NUTRITION ENDPOINT
# ============================================================================
# PURPOSE: Lazy import the nutrition estimator.
# WHY: Keeps the main module imports faster (avoids loading heavy LLM or regex logic until needed).
# ALTERNATIVE: Import at the top of the file (standard practice, but slow for CLI ops).
from Foodimg2Ing.nutrition import estimate_nutrition

# PURPOSE: Get nutrition for a saved recipe.
# WHY: Users want to know calories/macros for the food they plan to cook.
# IMPACT: Adds nutritional value to the recipe view.
@app.route('/api/recipes/<int:recipe_id>/nutrition', methods=['GET'])
@optional_token
def get_recipe_nutrition(user, recipe_id):
    recipe = db.session.get(Recipe, recipe_id)
    if not recipe:
        return jsonify({'error': 'Recipe not found'}), 404
        
    # AUTH: Check permission before showing nutrition for private recipes.
    is_owner = user and recipe.user_id == user.id
    if not is_owner and not recipe.is_public:
        return jsonify({'error': 'Access denied'}), 403
        
    try:
        # PURPOSE: Pass ingredients to the estimation engine.
        # IMPACT: Calculates estimated calories/protein/carbs based on ingredient strings.
        nutrition = estimate_nutrition(recipe.ingredients)
        return jsonify({
            'nutrition': nutrition
        }), 200
    except Exception as e:
        print(f"Error calculating nutrition: {e}")
        return jsonify({'error': 'Failed to calculate nutrition'}), 500

# PURPOSE: Estimate nutrition for unsaved text.
# WHY: Allows users to see nutrition data BEFORE they decide to save a generated recipe.
# IMPACT: Improves the 'Preview' experience.
@app.route('/api/nutrition/estimate', methods=['POST'])
@optional_token
def estimate_nutrition_adhoc(user):
    # PURPOSE: Parse temporary ingredients list.
    data = request.get_json()
    if not data or 'ingredients' not in data:
        return jsonify({'error': 'Ingredients list required'}), 400
        
    try:
        nutrition = estimate_nutrition(data['ingredients'])
        return jsonify({
            'nutrition': nutrition
        }), 200
    except Exception as e:
        print(f"Error calculating nutrition: {e}")
        return jsonify({'error': 'Failed to calculate nutrition'}), 500

