from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255))
    name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Dietary Preferences
    dietary_type = db.Column(db.String(50))  # vegan, vegetarian, keto, paleo, etc.
    allergies = db.Column(db.JSON)  # List of allergens
    cuisine_preferences = db.Column(db.JSON)  # List of preferred cuisines
    spice_level = db.Column(db.Integer, default=2)  # 1-5 scale
    
    # Relationships
    recipes = db.relationship('Recipe', backref='user', lazy=True, cascade='all, delete-orphan')
    ratings = db.relationship('Rating', backref='user', lazy=True, cascade='all, delete-orphan')
    favorites = db.relationship('Favorite', backref='user', lazy=True, cascade='all, delete-orphan')
    shopping_list = db.relationship('ShoppingItem', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if password matches hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user to dictionary (exclude sensitive data)"""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'dietary_type': self.dietary_type,
            'allergies': self.allergies or [],
            'cuisine_preferences': self.cuisine_preferences or [],
            'spice_level': self.spice_level,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Recipe(db.Model):
    __tablename__ = 'recipes'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    ingredients = db.Column(db.JSON, nullable=False)  # List of ingredients
    instructions = db.Column(db.JSON, nullable=False)  # List of steps
    image_url = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    is_public = db.Column(db.Boolean, default=False)
    
    # Relationships
    ratings = db.relationship('Rating', backref='recipe', lazy=True, cascade='all, delete-orphan')
    favorites = db.relationship('Favorite', backref='recipe', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, include_user=False):
        """Convert recipe to dictionary"""
        data = {
            'id': self.id,
            'title': self.title,
            'ingredients': self.ingredients,
            'instructions': self.instructions,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_public': self.is_public,
            'average_rating': self.get_average_rating(),
            'rating_count': len(self.ratings)
        }
        if include_user:
            data['user'] = {
                'id': self.user.id,
                'name': self.user.name
            }
        return data
    
    def get_average_rating(self):
        """Calculate average rating"""
        if not self.ratings:
            return None
        return sum(r.rating for r in self.ratings) / len(self.ratings)


class Rating(db.Model):
    __tablename__ = 'ratings'
    
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('recipe_id', 'user_id', name='unique_user_recipe_rating'),
        db.CheckConstraint('rating >= 1 AND rating <= 5', name='valid_rating'),
    )
    
    def to_dict(self, include_user=False):
        """Convert rating to dictionary"""
        data = {
            'id': self.id,
            'recipe_id': self.recipe_id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_user:
            data['user'] = {
                'id': self.user.id,
                'name': self.user.name
            }
        return data


class Favorite(db.Model):
    __tablename__ = 'favorites'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('user_id', 'recipe_id', name='unique_user_recipe_favorite'),
    )
    
    def to_dict(self):
        """Convert favorite to dictionary"""
        return {
            'id': self.id,
            'recipe_id': self.recipe_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'recipe': self.recipe.to_dict() if self.recipe else None
        }


class ShoppingItem(db.Model):
    __tablename__ = 'shopping_items'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    item = db.Column(db.String(255), nullable=False)
    is_checked = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'item': self.item,
            'is_checked': self.is_checked,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
