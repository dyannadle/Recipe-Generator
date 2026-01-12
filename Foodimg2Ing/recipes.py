"""
Recipe Management Routes
This file handles all recipe-related operations: saving, retrieving, deleting, and favoriting recipes.
"""

from flask import jsonify, request
from Foodimg2Ing import app, limiter
from Foodimg2Ing.models import db, Recipe, Favorite, Rating
from Foodimg2Ing.utils.security import token_required, optional_token
from sqlalchemy import desc

# ============================================================================
# SAVE RECIPE ENDPOINT
# ============================================================================
@app.route('/api/recipes/save', methods=['POST'])
@token_required  # This decorator ensures user is authenticated
@limiter.limit("20 per hour")  # Prevent spam - max 20 recipe saves per hour
def save_recipe(user):
    """
    Save a generated recipe to the database
    
    How it works:
    1. Extract recipe data from request (title, ingredients, instructions, image)
    2. Validate required fields are present
    3. Create new Recipe object linked to current user
    4. Save to database
    5. Return saved recipe with ID
    
    Args:
        user: Current authenticated user (injected by @token_required decorator)
    
    Returns:
        JSON with saved recipe data and success message
    """
    
    # Get JSON data from request body
    data = request.get_json()
    
    # Validate that we have the minimum required fields
    # We need at least a title and ingredients to save a recipe
    if not data or not data.get('title') or not data.get('ingredients'):
        return jsonify({'error': 'Title and ingredients are required'}), 400
    
    try:
        # Create a new Recipe instance
        # This creates a Python object that represents a database row
        recipe = Recipe(
            user_id=user.id,  # Link recipe to current user
            title=data['title'].strip(),  # Remove extra whitespace
            ingredients=data['ingredients'],  # List of ingredients (stored as JSON)
            instructions=data.get('instructions', []),  # List of steps (default to empty list)
            image_url=data.get('image_url'),  # Optional image URL
            is_public=data.get('is_public', False)  # Default to private
        )
        
        # Add the recipe to the database session
        # This stages the recipe for insertion but doesn't commit yet
        db.session.add(recipe)
        
        # Commit the transaction to actually save to database
        # This makes the changes permanent and generates the recipe.id
        db.session.commit()
        
        # Return success response with the saved recipe
        # The to_dict() method converts the Recipe object to a JSON-friendly dictionary
        return jsonify({
            'message': 'Recipe saved successfully',
            'recipe': recipe.to_dict()
        }), 201  # 201 = Created
    
    except Exception as e:
        # If anything goes wrong, rollback the transaction
        # This ensures database consistency
        db.session.rollback()
        
        # Log the error for debugging
        print(f"Error saving recipe: {e}")
        
        # Return generic error to user (don't expose internal details)
        return jsonify({'error': 'Failed to save recipe'}), 500


# ============================================================================
# GET USER'S RECIPES ENDPOINT
# ============================================================================
@app.route('/api/recipes/my-recipes', methods=['GET'])
@token_required  # Only authenticated users can view their recipes
def get_my_recipes(user):
    """
    Retrieve all recipes belonging to the current user
    
    How it works:
    1. Query database for all recipes where user_id matches current user
    2. Order by creation date (newest first)
    3. Convert each recipe to dictionary format
    4. Return as JSON array
    
    Args:
        user: Current authenticated user
    
    Returns:
        JSON array of user's recipes
    """
    
    try:
        # Query the database for recipes
        # Recipe.query creates a query builder
        # .filter_by(user_id=user.id) adds WHERE clause
        # .order_by(desc(Recipe.created_at)) sorts newest first
        # .all() executes query and returns list of Recipe objects
        recipes = Recipe.query.filter_by(user_id=user.id)\
                              .order_by(desc(Recipe.created_at))\
                              .all()
        
        # Convert each Recipe object to a dictionary
        # List comprehension: [recipe.to_dict() for recipe in recipes]
        # This transforms: [Recipe1, Recipe2] -> [{...}, {...}]
        recipes_data = [recipe.to_dict() for recipe in recipes]
        
        # Return the recipes array
        return jsonify({
            'recipes': recipes_data,
            'count': len(recipes_data)  # Include count for convenience
        }), 200
    
    except Exception as e:
        print(f"Error fetching recipes: {e}")
        return jsonify({'error': 'Failed to fetch recipes'}), 500


# ============================================================================
# GET SINGLE RECIPE ENDPOINT
# ============================================================================
@app.route('/api/recipes/<int:recipe_id>', methods=['GET'])
@optional_token  # Recipe can be viewed by anyone if public, or owner if private
def get_recipe(user, recipe_id):
    """
    Get a specific recipe by ID
    
    How it works:
    1. Find recipe in database by ID
    2. Check if user has permission to view (owner or public)
    3. Return recipe data
    
    Args:
        user: Current user (None if not authenticated)
        recipe_id: ID of recipe to retrieve
    
    Returns:
        JSON with recipe data
    """
    
    # Find recipe by ID
    # db.session.get(Model, id) is the SQLAlchemy 2.0 way to get by primary key
    recipe = db.session.get(Recipe, recipe_id)
    
    # Check if recipe exists
    if not recipe:
        return jsonify({'error': 'Recipe not found'}), 404
    
    # Check permissions
    # User can view if: they own it OR it's public
    is_owner = user and recipe.user_id == user.id
    if not is_owner and not recipe.is_public:
        return jsonify({'error': 'Access denied'}), 403
    
    # Return recipe with user info included
    return jsonify({
        'recipe': recipe.to_dict(include_user=True)
    }), 200


# ============================================================================
# DELETE RECIPE ENDPOINT
# ============================================================================
@app.route('/api/recipes/<int:recipe_id>', methods=['DELETE'])
@token_required  # Only authenticated users can delete
def delete_recipe(user, recipe_id):
    """
    Delete a recipe (only owner can delete)
    
    How it works:
    1. Find recipe by ID
    2. Verify user owns the recipe
    3. Delete from database
    4. Return success message
    
    Args:
        user: Current authenticated user
        recipe_id: ID of recipe to delete
    
    Returns:
        JSON success message
    """
    
    # Find the recipe
    recipe = db.session.get(Recipe, recipe_id)
    
    # Check if exists
    if not recipe:
        return jsonify({'error': 'Recipe not found'}), 404
    
    # Verify ownership
    # Only the user who created the recipe can delete it
    if recipe.user_id != user.id:
        return jsonify({'error': 'You can only delete your own recipes'}), 403
    
    try:
        # Delete the recipe
        # This will also delete related ratings and favorites due to cascade
        db.session.delete(recipe)
        
        # Commit the deletion
        db.session.commit()
        
        return jsonify({'message': 'Recipe deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting recipe: {e}")
        return jsonify({'error': 'Failed to delete recipe'}), 500


# ============================================================================
# FAVORITE/UNFAVORITE RECIPE ENDPOINT
# ============================================================================
@app.route('/api/recipes/<int:recipe_id>/favorite', methods=['POST', 'DELETE'])
@token_required  # Only authenticated users can favorite
def toggle_favorite(user, recipe_id):
    """
    Add or remove a recipe from favorites
    
    How it works:
    - POST: Add to favorites
    - DELETE: Remove from favorites
    
    Args:
        user: Current authenticated user
        recipe_id: ID of recipe to favorite/unfavorite
    
    Returns:
        JSON with success message and favorite status
    """
    
    # Verify recipe exists
    recipe = db.session.get(Recipe, recipe_id)
    if not recipe:
        return jsonify({'error': 'Recipe not found'}), 404
    
    # Check if already favorited
    # Query for existing favorite with this user_id and recipe_id
    existing_favorite = Favorite.query.filter_by(
        user_id=user.id,
        recipe_id=recipe_id
    ).first()  # .first() returns None if not found
    
    try:
        if request.method == 'POST':
            # ADD TO FAVORITES
            
            # Check if already favorited
            if existing_favorite:
                return jsonify({
                    'message': 'Recipe already in favorites',
                    'is_favorited': True
                }), 200
            
            # Create new favorite
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
            # REMOVE FROM FAVORITES
            
            # Check if favorited
            if not existing_favorite:
                return jsonify({
                    'message': 'Recipe not in favorites',
                    'is_favorited': False
                }), 200
            
            # Delete the favorite
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
@app.route('/api/recipes/favorites', methods=['GET'])
@token_required
def get_favorites(user):
    """
    Get all recipes favorited by the current user
    
    How it works:
    1. Query Favorite table for user's favorites
    2. Join with Recipe table to get recipe details
    3. Return array of favorited recipes
    
    Args:
        user: Current authenticated user
    
    Returns:
        JSON array of favorited recipes
    """
    
    try:
        # Query favorites for this user
        # Order by when they were favorited (newest first)
        favorites = Favorite.query.filter_by(user_id=user.id)\
                                  .order_by(desc(Favorite.created_at))\
                                  .all()
        
        # Convert to dictionaries
        # Each favorite.to_dict() includes the full recipe data
        favorites_data = [favorite.to_dict() for favorite in favorites]
        
        return jsonify({
            'favorites': favorites_data,
            'count': len(favorites_data)
        }), 200
    
    except Exception as e:
        print(f"Error fetching favorites: {e}")
        return jsonify({'error': 'Failed to fetch favorites'}), 500
