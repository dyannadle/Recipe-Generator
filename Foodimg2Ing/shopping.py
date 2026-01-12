from flask import jsonify, request
from Foodimg2Ing import app, limiter
from Foodimg2Ing.models import db, ShoppingItem, Recipe
from Foodimg2Ing.utils.security import token_required
from sqlalchemy import desc

# ============================================================================
# GET SHOPPING LIST
# ============================================================================
@app.route('/api/shopping-list', methods=['GET'])
@token_required
def get_shopping_list(user):
    try:
        items = ShoppingItem.query.filter_by(user_id=user.id)\
                                  .order_by(desc(ShoppingItem.created_at))\
                                  .all()
        
        return jsonify({
            'items': [item.to_dict() for item in items]
        }), 200
    except Exception as e:
        print(f"Error fetching shopping list: {e}")
        return jsonify({'error': 'Failed to fetch shopping list'}), 500

# ============================================================================
# ADD ITEM
# ============================================================================
@app.route('/api/shopping-list', methods=['POST'])
@token_required
def add_shopping_item(user):
    data = request.get_json()
    if not data or 'item' not in data:
        return jsonify({'error': 'Item name required'}), 400
        
    try:
        item = ShoppingItem(
            user_id=user.id,
            item=data['item'].strip()
        )
        db.session.add(item)
        db.session.commit()
        
        return jsonify({
            'message': 'Item added',
            'item': item.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add item'}), 500

# ============================================================================
# BULK ADD RECIPE INGREDIENTS
# ============================================================================
@app.route('/api/shopping-list/add-recipe', methods=['POST'])
@token_required
def add_recipe_to_list(user):
    data = request.get_json()
    if not data or 'recipe_id' not in data:
        return jsonify({'error': 'Recipe ID required'}), 400
        
    try:
        recipe = db.session.get(Recipe, data['recipe_id'])
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
            
        items_added = 0
        for ing in recipe.ingredients:
            # Optional: Check if already exists to avoid dupes? 
            # For now, let's allow duplicates or maybe check exact string match
            # But "2 eggs" and "Eggs" are different.
            # Simple approach: Just add them.
            item = ShoppingItem(
                user_id=user.id,
                item=ing
            )
            db.session.add(item)
            items_added += 1
            
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
@app.route('/api/shopping-list/<int:item_id>/toggle', methods=['PUT'])
@token_required
def toggle_shopping_item(user, item_id):
    try:
        item = db.session.get(ShoppingItem, item_id)
        if not item or item.user_id != user.id:
            return jsonify({'error': 'Item not found'}), 404
            
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
@app.route('/api/shopping-list/<int:item_id>', methods=['DELETE'])
@token_required
def delete_shopping_item(user, item_id):
    try:
        item = db.session.get(ShoppingItem, item_id)
        if not item or item.user_id != user.id:
            return jsonify({'error': 'Item not found'}), 404
            
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({'message': 'Item deleted'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to delete item'}), 500

# ============================================================================
# CLEAR LIST (e.g. remove all, or remove checked)
# ============================================================================
@app.route('/api/shopping-list/clear', methods=['DELETE'])
@token_required
def clear_shopping_list(user):
    # Optional param ?type=checked to only clear checked
    clear_type = request.args.get('type', 'all')
    
    try:
        query = ShoppingItem.query.filter_by(user_id=user.id)
        if clear_type == 'checked':
            query = query.filter_by(is_checked=True)
            
        deleted_count = query.delete()
        db.session.commit()
        
        return jsonify({'message': f'Cleared {deleted_count} items'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to clear list'}), 500
