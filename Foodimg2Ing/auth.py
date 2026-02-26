# PURPOSE: Import Flask utilities for JSON formatting and request data handling.
# WHY: 'jsonify' sends standard JSON responses; 'request' accesses inputs like email/password.
# IMPACT: Enables the authentication API to receive and respond to frontend data.
from flask import jsonify, request

# PURPOSE: Import the main app instance and rate limiter from the package core.
# WHY: 'app' is needed for @app.route; 'limiter' is critical for auth to prevent brute-force attacks.
# IMPACT: Connects this module to the application's global configuration and security gates.
from Foodimg2Ing import app, limiter

# PURPOSE: Import database session and User data model.
# WHY: 'db' manages transactions; 'User' is where accounts are stored and verified.
# IMPACT: Provides the persistence layer for account management.
from Foodimg2Ing.models import db, User

# PURPOSE: Import custom security helpers for JWT (JSON Web Token) management.
# WHY: 'generate_token' creates a session for the user; 'token_required' protects endpoints.
# IMPACT: Handles the actual 'identity' logic of the site.
from Foodimg2Ing.utils.security import generate_token, token_required

# PURPOSE: Import Regular Expression library.
# WHY: Used for complex string pattern matching like email validation.
# IMPACT: Basic utility for input sanitization.
import re

# PURPOSE: Helper function to verify if a string looks like a valid email address.
# WHY: Prevents users from registering with junk text that isn't a real email.
# IMPACT: Improves data quality and ensures users can potentially reset passwords via email later.
def is_valid_email(email):
    # PURPOSE: Standard regex pattern for email validation.
    # WHY: Checks for the @ symbol and a domain extension (.com, .org, etc.).
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    # PURPOSE: Return True if the pattern matches, else False.
    return re.match(pattern, email) is not None

# ============================================================================
# USER REGISTRATION
# ============================================================================
# PURPOSE: API endpoint for creating a new account.
# WHY: Entry point for new users to join the site.
# IMPACT: Populates the 'users' table.
@app.route('/api/auth/register', methods=['POST'])
# PURPOSE: Limit registration attempts.
# WHY: Prevents bots from creating thousands of accounts to spam the database.
# IMPACT: Bot protection.
@limiter.limit("3 per hour")  
def register():
    # PURPOSE: Capture JSON input from the frontend.
    data = request.get_json()
    
    # PURPOSE: Validate that the necessary fields exist in the request.
    # WHY: Prevents server-side errors if the frontend sends incomplete data.
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    # PURPOSE: Standardize inputs.
    # WHY: '.lower()' ensures 'User@Gmail.com' is the same as 'user@gmail.com'.
    # '.strip()' removes accidental spaces.
    email = data['email'].lower().strip()
    password = data['password']
    name = data.get('name', '').strip()
    
    # PURPOSE: Verify the email format using the helper function.
    if not is_valid_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # PURPOSE: Enforce a minimum password length.
    # WHY: Short passwords are easily cracked.
    # IMPACT: Basic security policy.
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    # PURPOSE: Check for duplicate accounts.
    # WHY: Two users cannot have the same email address in our system.
    # IMPACT: Ensures unique user identities.
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 409
    
    try:
        # PURPOSE: Create a new User object.
        # WHY: To prepare a new row for the database.
        # IMPACT: Temporary object in RAM.
        user = User(email=email, name=name or email.split('@')[0])
        # PURPOSE: Hash the password.
        # WHY: NEVER store plain-text passwords. Hashing makes them unreadable even if the DB is leaked.
        # IMPACT: Critical security best practice.
        user.set_password(password)
        
        # PURPOSE: Save the user to the database.
        db.session.add(user)
        db.session.commit()
        
        # PURPOSE: Log the user in automatically after registration.
        # WHY: Better UX; doesn't force the user to login immediately after signing up.
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

# ============================================================================
# USER LOGIN
# ============================================================================
# PURPOSE: API endpoint for existing users to sign in.
# WHY: Allows users to access their saved recipes and preferences.
# IMPACT: Issues a JWT token for session management.
@app.route('/api/auth/login', methods=['POST'])
# PURPOSE: Limit login attempts.
# WHY: Prevents brute-force password guessing attacks.
# IMPACT: Security gate.
@limiter.limit("5 per minute")
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    email = data['email'].lower().strip()
    password = data['password']
    
    # PURPOSE: Look up the user by email.
    user = User.query.filter_by(email=email).first()
    
    # PURPOSE: Verify identity.
    # WHY: Checks if the user exists AND if the provided password matches the hashed one.
    # IMPACT: The 'Go/No-go' gate for the entire app.
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # PURPOSE: Issue a session token (JWT).
    # WHY: The frontend will store this and send it with every future request.
    # IMPACT: Enables persistent login.
    token = generate_token(user.id)
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200

# ============================================================================
# GET USER INFO
# ============================================================================
# PURPOSE: Endpoint for the frontend to check if the current token is still valid.
# WHY: Used on page refresh to restore the user's state.
@app.route('/api/auth/me', methods=['GET'])
# PURPOSE: Protect route with token verification.
@token_required
def get_current_user(user):
    # PURPOSE: Return the current logged-in user's data.
    return jsonify({'user': user.to_dict()}), 200

# ============================================================================
# UPDATE PREFERENCES
# ============================================================================
# PURPOSE: Allows users to save their dietary restrictions or name.
# WHY: Personalizes the recipe generation experience.
# IMPACT: Modifies the 'users' table record.
@app.route('/api/auth/preferences', methods=['PUT'])
@token_required
def update_preferences(user):
    data = request.get_json()
    
    try:
        # PURPOSE: Conditional updates.
        # WHY: Allows updating just one field without needing to send all of them.
        if 'dietary_type' in data:
            user.dietary_type = data['dietary_type']
        
        if 'allergies' in data:
            user.allergies = data['allergies']
        
        if 'cuisine_preferences' in data:
            user.cuisine_preferences = data['cuisine_preferences']
        
        # PURPOSE: Validate numeric input for spice level.
        if 'spice_level' in data:
            spice_level = int(data['spice_level'])
            if 1 <= spice_level <= 5:
                user.spice_level = spice_level
        
        if 'name' in data:
            user.name = data['name'].strip()
        
        # PURPOSE: Persist changed preferences.
        db.session.commit()
        
        return jsonify({
            'message': 'Preferences updated successfully',
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Update preferences error: {e}")
        return jsonify({'error': 'Failed to update preferences'}), 500

# ============================================================================
# CHANGE PASSWORD
# ============================================================================
# PURPOSE: Endpoint for users to update their password.
# WHY: Essential account management feature.
@app.route('/api/auth/change-password', methods=['PUT'])
@token_required
def change_password(user):
    data = request.get_json()
    
    if not data or not data.get('current_password') or not data.get('new_password'):
        return jsonify({'error': 'Current and new password are required'}), 400
    
    # PURPOSE: Security check.
    # WHY: You must know the OLD password to set a NEW one. 
    # Prevents anyone who leaves their computer logged in from having their account stolen.
    if not user.check_password(data['current_password']):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    if len(data['new_password']) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400
    
    try:
        # PURPOSE: Update and hash the new password.
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Change password error: {e}")
        return jsonify({'error': 'Failed to change password'}), 500

