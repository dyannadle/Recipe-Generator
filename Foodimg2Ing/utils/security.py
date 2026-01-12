import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from Foodimg2Ing.models import User
import os

def generate_token(user_id):
    """Generate JWT token for user"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=24),  # 24 hour expiration
        'iat': datetime.utcnow()
    }
    return jwt.encode(
        payload,
        os.getenv('JWT_SECRET_KEY', 'dev-secret-key'),
        algorithm='HS256'
    )

def decode_token(token):
    """Decode JWT token"""
    try:
        payload = jwt.decode(
            token,
            os.getenv('JWT_SECRET_KEY', 'dev-secret-key'),
            algorithms=['HS256']
        )
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        # Decode token
        user_id = decode_token(token)
        if not user_id:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        # Get user
        from Foodimg2Ing.models import db
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 401
        
        # Pass user to route
        return f(user, *args, **kwargs)
    
    return decorated

def optional_token(f):
    """Decorator for optional authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        user = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
                user_id = decode_token(token)
                if user_id:
                    from Foodimg2Ing.models import db
                    user = db.session.get(User, user_id)
            except:
                pass
        
        return f(user, *args, **kwargs)
    
    return decorated
