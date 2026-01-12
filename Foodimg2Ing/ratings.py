"""
Rating System Routes
This file handles recipe rating functionality - users can rate recipes 1-5 stars and leave comments.
"""

from flask import jsonify, request
from Foodimg2Ing import app, limiter
from Foodimg2Ing.models import db, Recipe, Rating
from Foodimg2Ing.utils.security import token_required
from sqlalchemy import func

# ============================================================================
# RATE A RECIPE ENDPOINT
# ============================================================================
@app.route('/api/recipes/<int:recipe_id>/rate', methods=['POST'])
@token_required  # Only authenticated users can rate
@limiter.limit("10 per hour")  # Prevent spam ratings
def rate_recipe(user, recipe_id):
    """
    Rate a recipe (1-5 stars) with optional comment
    
    How this works:
    1. Validate recipe exists
    2. Check rating value is between 1-5
    3. Check if user already rated this recipe
    4. If yes: Update existing rating
    5. If no: Create new rating
    6. Recalculate average rating
    7. Return updated rating info
    
    Args:
        user: Current authenticated user (from @token_required)
        recipe_id: ID of recipe to rate
    
    Request Body:
        {
            "rating": 1-5 (required),
            "comment": "Optional text comment"
        }
    
    Returns:
        JSON with rating data and updated average
    """
    
    # Get JSON data from request
    data = request.get_json()
    
    # Validate rating value is provided
    if not data or 'rating' not in data:
        return jsonify({'error': 'Rating value is required'}), 400
    
    # Extract rating value and convert to integer
    try:
        rating_value = int(data['rating'])
    except (ValueError, TypeError):
        return jsonify({'error': 'Rating must be a number'}), 400
    
    # Validate rating is in valid range (1-5 stars)
    if rating_value < 1 or rating_value > 5:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400
    
    # Verify recipe exists
    recipe = db.session.get(Recipe, recipe_id)
    if not recipe:
        return jsonify({'error': 'Recipe not found'}), 404
    
    # Get optional comment (default to None if not provided)
    comment = data.get('comment', '').strip() or None
    
    try:
        # Check if user already rated this recipe
        # We use filter_by to find rating with matching user_id AND recipe_id
        existing_rating = Rating.query.filter_by(
            user_id=user.id,
            recipe_id=recipe_id
        ).first()
        
        if existing_rating:
            # UPDATE EXISTING RATING
            # User is changing their previous rating
            
            existing_rating.rating = rating_value
            existing_rating.comment = comment
            # created_at stays the same (original rating date)
            
            message = 'Rating updated successfully'
        
        else:
            # CREATE NEW RATING
            # This is the first time user is rating this recipe
            
            new_rating = Rating(
                user_id=user.id,
                recipe_id=recipe_id,
                rating=rating_value,
                comment=comment
            )
            
            # Add to session
            db.session.add(new_rating)
            
            # Update reference for response
            existing_rating = new_rating
            
            message = 'Rating added successfully'
        
        # Commit the changes to database
        db.session.commit()
        
        # Calculate new average rating for this recipe
        # We use SQLAlchemy's func.avg() to calculate average in database
        average_rating = db.session.query(
            func.avg(Rating.rating)  # Average of all rating values
        ).filter(
            Rating.recipe_id == recipe_id  # For this specific recipe
        ).scalar()  # .scalar() returns single value instead of tuple
        
        # Round to 1 decimal place (e.g., 4.3)
        average_rating = round(average_rating, 1) if average_rating else None
        
        # Count total ratings
        rating_count = Rating.query.filter_by(recipe_id=recipe_id).count()
        
        # Return success response
        return jsonify({
            'message': message,
            'rating': existing_rating.to_dict(),
            'average_rating': average_rating,
            'rating_count': rating_count
        }), 200 if message.startswith('Rating updated') else 201
    
    except Exception as e:
        # Rollback on error
        db.session.rollback()
        print(f"Error rating recipe: {e}")
        return jsonify({'error': 'Failed to save rating'}), 500


# ============================================================================
# GET RECIPE RATINGS ENDPOINT
# ============================================================================
@app.route('/api/recipes/<int:recipe_id>/ratings', methods=['GET'])
def get_recipe_ratings(recipe_id):
    """
    Get all ratings for a specific recipe
    
    How this works:
    1. Verify recipe exists
    2. Query all ratings for this recipe
    3. Order by newest first
    4. Include user info with each rating
    5. Calculate average rating
    6. Return ratings array with stats
    
    Args:
        recipe_id: ID of recipe
    
    Returns:
        JSON with ratings array and statistics
    """
    
    # Verify recipe exists
    recipe = db.session.get(Recipe, recipe_id)
    if not recipe:
        return jsonify({'error': 'Recipe not found'}), 404
    
    try:
        # Get all ratings for this recipe
        # Order by created_at descending (newest first)
        ratings = Rating.query.filter_by(recipe_id=recipe_id)\
                              .order_by(Rating.created_at.desc())\
                              .all()
        
        # Convert to dictionaries with user info
        # include_user=True adds user name to each rating
        ratings_data = [rating.to_dict(include_user=True) for rating in ratings]
        
        # Calculate average rating
        # Use recipe's built-in method
        average_rating = recipe.get_average_rating()
        
        # Return ratings with statistics
        return jsonify({
            'ratings': ratings_data,
            'count': len(ratings_data),
            'average_rating': round(average_rating, 1) if average_rating else None
        }), 200
    
    except Exception as e:
        print(f"Error fetching ratings: {e}")
        return jsonify({'error': 'Failed to fetch ratings'}), 500


# ============================================================================
# GET USER'S RATING FOR A RECIPE
# ============================================================================
@app.route('/api/recipes/<int:recipe_id>/my-rating', methods=['GET'])
@token_required
def get_my_rating(user, recipe_id):
    """
    Get the current user's rating for a specific recipe
    
    Useful for:
    - Showing user's previous rating when they view a recipe
    - Pre-filling rating form with their existing rating
    
    Args:
        user: Current authenticated user
        recipe_id: ID of recipe
    
    Returns:
        JSON with user's rating or null if not rated
    """
    
    # Find user's rating for this recipe
    my_rating = Rating.query.filter_by(
        user_id=user.id,
        recipe_id=recipe_id
    ).first()
    
    # Return rating if exists, otherwise null
    if my_rating:
        return jsonify({
            'rating': my_rating.to_dict()
        }), 200
    else:
        return jsonify({
            'rating': None
        }), 200


# ============================================================================
# DELETE RATING ENDPOINT
# ============================================================================
@app.route('/api/recipes/<int:recipe_id>/rate', methods=['DELETE'])
@token_required
def delete_rating(user, recipe_id):
    """
    Delete user's rating for a recipe
    
    How this works:
    1. Find user's rating for this recipe
    2. Verify it exists
    3. Delete from database
    4. Return success message
    
    Args:
        user: Current authenticated user
        recipe_id: ID of recipe
    
    Returns:
        JSON success message
    """
    
    # Find the rating
    rating = Rating.query.filter_by(
        user_id=user.id,
        recipe_id=recipe_id
    ).first()
    
    # Check if exists
    if not rating:
        return jsonify({'error': 'Rating not found'}), 404
    
    try:
        # Delete the rating
        db.session.delete(rating)
        db.session.commit()
        
        # Recalculate average
        recipe = db.session.get(Recipe, recipe_id)
        average_rating = recipe.get_average_rating()
        rating_count = len(recipe.ratings)
        
        return jsonify({
            'message': 'Rating deleted successfully',
            'average_rating': round(average_rating, 1) if average_rating else None,
            'rating_count': rating_count
        }), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting rating: {e}")
        return jsonify({'error': 'Failed to delete rating'}), 500
