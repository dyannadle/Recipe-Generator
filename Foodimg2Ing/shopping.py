# PURPOSE: Import Flask's 'jsonify' for JSON responses and 'request' for handling incoming HTTP data.
# WHY: 'jsonify' ensures standard JSON formatting and 'request' allows reading JSON payloads from the client.
# ALTERNATIVE: Use standard 'json' library and manual response headers, but 'jsonify' is the Flask-native way.
# IMPACT: Enables the server to send machine-readable data and receive user input.
from flask import jsonify, request

# PURPOSE: Import the main app instance and rate limiter from the package core.
# WHY: 'app' is needed for routing (@app.route), and 'limiter' prevents API abuse (DDoS/Spam).
# ALTERNATIVE: Circular imports or redefining the app instance (bad practice).
# IMPACT: Connects this module to the global application state and protection layers.
from Foodimg2Ing import app, limiter

# PURPOSE: Import database session (db) and data models (ShoppingItem, Recipe).
# WHY: Allows querying the database and creating/modifying shopping list or recipe records.
# ALTERNATIVE: Raw SQL queries via 'sqlite3' or similar, but SQLAlchemy provides a safer ORM layer.
# IMPACT: Provides the core data persistence functionality for the shopping list feature.
from Foodimg2Ing.models import db, ShoppingItem, Recipe

# PURPOSE: Import the 'token_required' decorator for authentication.
# WHY: Protects private routes so only logged-in users can access their own shopping data.
# ALTERNATIVE: Manual token verification in every function, which is redundant and error-prone.
# IMPACT: Secures the API; without this, anyone could read/modify any user's shopping list.
from Foodimg2Ing.utils.security import token_required

# PURPOSE: Import 'desc' from SQLAlchemy for sorting.
# WHY: Allows sorting query results in descending order (e.g., newest items first).
# ALTERNATIVE: Fetch all items and sort in Python memory, but database-level sorting is much faster.
# IMPACT: Improves User Experience by showing the most recently added items at the top.
from sqlalchemy import desc

# ============================================================================
# GET SHOPPING LIST
# ============================================================================
# PURPOSE: Define the API endpoint for fetching a user's shopping list.
# WHY: Standard RESTful GET request to retrieve resources.
# ALTERNATIVE: Could use a GraphQL query, but REST is simpler for this project's scale.
# IMPACT: Main entry point for the frontend to display the shopping list UI.
@app.route('/api/shopping-list', methods=['GET'])
# PURPOSE: Ensure the requester is authenticated and get their 'user' object.
# WHY: Filters data so users only see their own items.
# ALTERNATIVE: Pass user_id as a URL param (insecure).
# IMPACT: Validates session/token before executing any database logic.
@token_required
def get_shopping_list(user):
    # PURPOSE: Wrapping logic in try/except for error handling.
    # WHY: Prevents the server from crashing if a database error occurs.
    # ALTERNATIVE: Global error handlers (more complex to set up per-route).
    # IMPACT: Ensures the site returns a polite error message instead of an empty response.
    try:
        # PURPOSE: Query the ShoppingItem table for items belonging to the current user.
        # WHY: Filters the results so user A cannot see user B's groceries.
        # IMPACT: Critical for data privacy.
        items = ShoppingItem.query.filter_by(user_id=user.id)\
                                  .order_by(desc(ShoppingItem.created_at))\
                                  .all()
        
        # PURPOSE: Return the list of items as a JSON object with a 200 OK status.
        # WHY: Frontend expects a standard JSON structure for easy parsing.
        # ALTERNATIVE: Return raw HTML (old school) or XML.
        # IMPACT: Sends the actual grocery data back to the browser.
        return jsonify({
            'items': [item.to_dict() for item in items]
        }), 200
    except Exception as e:
        # PURPOSE: Log the error to the console for debugging.
        # WHY: Helps developers see exactly what went wrong in the terminal.
        # IMPACT: Internal visibility into server health.
        print(f"Error fetching shopping list: {e}")
        # PURPOSE: Send a 500 status code indicating a server-side failure.
        # IMPACT: Alerts the frontend that something went wrong so it can show an error toast.
        return jsonify({'error': 'Failed to fetch shopping list'}), 500

# ============================================================================
# ADD ITEM
# ============================================================================
# PURPOSE: Define the POST endpoint to create a new shopping item.
# WHY: Allows users to manually type in groceries.
# IMPACT: Essential for the 'Add Item' text input on the site.
@app.route('/api/shopping-list', methods=['POST'])
@token_required
def add_shopping_item(user):
    # PURPOSE: Parse the incoming JSON body from the POST request.
    # WHY: To extract the 'item' name provided by the user.
    # IMPACT: Core data intake.
    data = request.get_json()
    # PURPOSE: Validate the input.
    # WHY: Prevents empty items or malformed requests from corrupting the DB.
    # IMPACT: Basic input sanitization.
    if not data or 'item' not in data:
        return jsonify({'error': 'Item name required'}), 400
        
    try:
        # PURPOSE: Create a new instance of the ShoppingItem model.
        # WHY: Maps the user's input to the database schema.
        # IMPACT: Prepares a database record for insertion.
        item = ShoppingItem(
            user_id=user.id,
            item=data['item'].strip()
        )
        # PURPOSE: Add the item to the current database session.
        # WHY: SQLAlchemy buffers changes before committing to disk.
        # IMPACT: Stages the new item for saving.
        db.session.add(item)
        # PURPOSE: Write the changes to the database permanently.
        # WHY: Without this, the item would be lost when the request ends.
        # IMPACT: Finalizes the 'Add' action in the permanent storage.
        db.session.commit()
        
        return jsonify({
            'message': 'Item added',
            'item': item.to_dict()
        }), 201
    except Exception as e:
        # PURPOSE: Undo any pending changes if an error occurs.
        # WHY: Keeps the database in a consistent state (avoids partial writes).
        # IMPACT: Prevents database corruption or locked threads.
        db.session.rollback()
        return jsonify({'error': 'Failed to add item'}), 500

# ============================================================================
# BULK ADD RECIPE INGREDIENTS
# ============================================================================
# PURPOSE: Endpoint to add all ingredients from a recipe to the shopping list at once.
# WHY: Major convenience feature; saves users from typing out 10+ ingredients manually.
# IMPACT: High-value UX feature for the recipe generator.
@app.route('/api/shopping-list/add-recipe', methods=['POST'])
@token_required
def add_recipe_to_list(user):
    data = request.get_json()
    if not data or 'recipe_id' not in data:
        return jsonify({'error': 'Recipe ID required'}), 400
        
    try:
        # PURPOSE: Look up the recipe details in the database using its ID.
        # WHY: To verify the recipe exists and access its ingredients list.
        # IMPACT: Core lookup for the 'Add to List' button on recipe cards.
        recipe = db.session.get(Recipe, data['recipe_id'])
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
            
        items_added = 0
        # PURPOSE: Iterate through every ingredient in the recipe's ingredient list.
        # WHY: To create a separate shopping item for each one.
        # IMPACT: Transfers recipe data to the user's personal grocery list.
        for ing in recipe.ingredients:
            # PURPOSE: Instantiate a shopping item for the specific ingredient.
            item = ShoppingItem(
                user_id=user.id,
                item=ing
            )
            # PURPOSE: Group all additions into one session.
            db.session.add(item)
            items_added += 1
            
        # PURPOSE: Commit all ingredients in a single transaction.
        # WHY: Much faster than committing after every single ingredient.
        # IMPACT: Efficiently updates the user's list.
        db.session.commit()
        return jsonify({
            'message': f'Added {items_added} ingredients to shopping list',
            'count': items_added
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error adding recipe ingredients: {e}")
        return jsonify({'error': 'Failed to add ingredients'}), 500

# ============================================================================
# TOGGLE ITEM
# ============================================================================
# PURPOSE: PUT endpoint to mark an item as 'checked' (done) or 'unchecked'.
# WHY: Allows users to cross off items while they are actually shopping.
# IMPACT: Core interactivity for the shopping list UI (checkmarks).
@app.route('/api/shopping-list/<int:item_id>/toggle', methods=['PUT'])
@token_required
def toggle_shopping_item(user, item_id):
    try:
        # PURPOSE: Fetch the specific item by ID.
        item = db.session.get(ShoppingItem, item_id)
        # PURPOSE: Authorization check.
        # WHY: Prevents User A from checking off User B's items if they guess the ID.
        # IMPACT: Data security.
        if not item or item.user_id != user.id:
            return jsonify({'error': 'Item not found'}), 404
            
        # PURPOSE: Flip the boolean 'is_checked' flag.
        # WHY: Reverses the current state (True -> False or False -> True).
        # IMPACT: Directly updates the UI state for the user.
        item.is_checked = not item.is_checked
        db.session.commit()
        
        return jsonify({
            'item': item.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to update item'}), 500

# ============================================================================
# DELETE ITEM
# ============================================================================
# PURPOSE: Endpoint to permanently remove a single item from the database.
# WHY: To let users clean up their list or remove mistakes.
# IMPACT: Essential for list management.
@app.route('/api/shopping-list/<int:item_id>', methods=['DELETE'])
@token_required
def delete_shopping_item(user, item_id):
    try:
        item = db.session.get(ShoppingItem, item_id)
        # PURPOSE: Security check to ensure owner is the one deleting.
        if not item or item.user_id != user.id:
            return jsonify({'error': 'Item not found'}), 404
            
        # PURPOSE: Mark the object for deletion from the database.
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({'message': 'Item deleted'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to delete item'}), 500

# ============================================================================
# CLEAR LIST (e.g. remove all, or remove checked)
# ============================================================================
# PURPOSE: DELETE endpoint to remove multiple items at once based on a type.
# WHY: Convenience for finishing a shopping trip (clear all checked).
# IMPACT: Helps users reset their list quickly.
@app.route('/api/shopping-list/clear', methods=['DELETE'])
@token_required
def clear_shopping_list(user):
    # PURPOSE: Read URL parameters to decide what to clear.
    # WHY: Allows one endpoint to handle both 'Clear All' and 'Clear Finished'.
    # ALTERNATIVE: Use two different endpoints.
    # IMPACT: Functional flexibility.
    clear_type = request.args.get('type', 'all')
    
    try:
        # PURPOSE: Start a query filtered by the owner.
        query = ShoppingItem.query.filter_by(user_id=user.id)
        # PURPOSE: Conditionally narrow the query to only checked items.
        # WHY: Specific cleanup vs. full nuking of the list.
        # IMPACT: Preserves unchecked items if the user only wants to clear what they bought.
        if clear_type == 'checked':
            query = query.filter_by(is_checked=True)
            
        # PURPOSE: Bulk delete all matching records in one SQL command.
        # WHY: Much faster than fetching all items and deleting them one-by-one in a loop.
        # IMPACT: High performance for large lists.
        deleted_count = query.delete()
        db.session.commit()
        
        return jsonify({'message': f'Cleared {deleted_count} items'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to clear list'}), 500

