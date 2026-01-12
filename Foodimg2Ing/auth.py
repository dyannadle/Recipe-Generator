from flask import jsonify, request
from Foodimg2Ing import app, limiter
from Foodimg2Ing.models import db, User
from Foodimg2Ing.utils.security import generate_token, token_required
import re

def is_valid_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@app.route('/api/auth/register', methods=['POST'])
@limiter.limit("3 per hour")  # Prevent spam registrations
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    email = data['email'].lower().strip()
    password = data['password']
    name = data.get('name', '').strip()
    
    # Validate email format
    if not is_valid_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Validate password strength
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 409
    
    # Create new user
    try:
        user = User(email=email, name=name or email.split('@')[0])
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Generate token
        token = generate_token(user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': user.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    """Login user"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    email = data['email'].lower().strip()
    password = data['password']
    
    # Find user
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Generate token
    token = generate_token(user.id)
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(user):
    """Get current authenticated user"""
    return jsonify({'user': user.to_dict()}), 200

@app.route('/api/auth/preferences', methods=['PUT'])
@token_required
def update_preferences(user):
    """Update user dietary preferences"""
    data = request.get_json()
    
    try:
        if 'dietary_type' in data:
            user.dietary_type = data['dietary_type']
        
        if 'allergies' in data:
            user.allergies = data['allergies']
        
        if 'cuisine_preferences' in data:
            user.cuisine_preferences = data['cuisine_preferences']
        
        if 'spice_level' in data:
            spice_level = int(data['spice_level'])
            if 1 <= spice_level <= 5:
                user.spice_level = spice_level
        
        if 'name' in data:
            user.name = data['name'].strip()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Preferences updated successfully',
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Update preferences error: {e}")
        return jsonify({'error': 'Failed to update preferences'}), 500

@app.route('/api/auth/change-password', methods=['PUT'])
@token_required
def change_password(user):
    """Change user password"""
    data = request.get_json()
    
    if not data or not data.get('current_password') or not data.get('new_password'):
        return jsonify({'error': 'Current and new password are required'}), 400
    
    # Verify current password
    if not user.check_password(data['current_password']):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Validate new password
    if len(data['new_password']) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400
    
    try:
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Change password error: {e}")
        return jsonify({'error': 'Failed to change password'}), 500
