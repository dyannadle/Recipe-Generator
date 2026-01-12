# Phase 2B - Recipe Management & Ratings

## Overview
Phase 2B adds recipe saving, dashboard, and rating functionality with **detailed line-by-line code explanations** for learning purposes.

## What Was Implemented

### Backend Routes ✅

#### 1. Recipe Management (`Foodimg2Ing/recipes.py`)
**300+ lines with detailed explanations**

**Endpoints:**
- `POST /api/recipes/save` - Save generated recipe
  - Validates title and ingredients
  - Creates Recipe object
  - Links to current user
  - Returns saved recipe with ID

- `GET /api/recipes/my-recipes` - Get user's recipes
  - Queries by user_id
  - Orders by created_at (newest first)
  - Returns array of recipes

- `GET /api/recipes/<id>` - Get single recipe
  - Checks permissions (owner or public)
  - Returns recipe with user info

- `DELETE /api/recipes/<id>` - Delete recipe
  - Verifies ownership
  - Cascades to ratings/favorites
  - Returns success message

- `POST/DELETE /api/recipes/<id>/favorite` - Toggle favorite
  - POST: Adds to favorites
  - DELETE: Removes from favorites
  - Prevents duplicates

- `GET /api/recipes/favorites` - Get user's favorites
  - Returns favorited recipes with details

**Key Concepts Explained:**
- SQLAlchemy queries (`filter_by`, `order_by`, `desc`)
- Database sessions (`add`, `commit`, `rollback`)
- Decorators (`@token_required`, `@limiter.limit`)
- Error handling patterns
- JSON serialization

#### 2. Rating System (`Foodimg2Ing/ratings.py`)
**250+ lines with detailed explanations**

**Endpoints:**
- `POST /api/recipes/<id>/rate` - Rate recipe (1-5 stars)
  - Validates rating value (1-5)
  - Updates existing or creates new
  - Calculates average rating
  - Returns updated stats

- `GET /api/recipes/<id>/ratings` - Get all ratings
  - Returns ratings with user info
  - Includes average and count

- `GET /api/recipes/<id>/my-rating` - Get user's rating
  - Returns user's rating or null

- `DELETE /api/recipes/<id>/rate` - Delete rating
  - Removes user's rating
  - Recalculates average

**Key Concepts Explained:**
- Aggregate functions (`func.avg()`)
- Unique constraints
- Update vs Create logic
- Rating calculation

---

### Frontend Components ✅

#### 1. SaveRecipeButton (`frontend/src/components/SaveRecipeButton.jsx`)
**200+ lines with detailed explanations**

**Features:**
- Authentication check
- API call to save recipe
- Loading states
- Success/error feedback
- Disabled when saved

**Concepts Explained:**
- `useState` hook for state management
- `async/await` for API calls
- `try/catch/finally` error handling
- Conditional rendering
- Optional chaining (`?.`)
- Toast notifications

**Code Example:**
```javascript
// State for tracking save status
const [isSaved, setIsSaved] = useState(false);
const [loading, setLoading] = useState(false);

// Async function to save recipe
const handleSave = async () => {
    setLoading(true);
    try {
        const response = await axios.post('/api/recipes/save', recipe);
        setIsSaved(true);
        toast.success('Recipe saved!');
    } catch (error) {
        toast.error(error.response?.data?.error || 'Failed');
    } finally {
        setLoading(false);
    }
};
```

#### 2. StarRating (`frontend/src/components/StarRating.jsx`)
**250+ lines with detailed explanations**

**Features:**
- Display mode (read-only)
- Input mode (interactive)
- Half-star support
- Hover preview
- Rating count display

**Concepts Explained:**
- Hover state management
- Half-star rendering with CSS `clip-path`
- Event handlers (`onClick`, `onMouseEnter`, `onMouseLeave`)
- Props with default values
- Conditional styling

**Half-Star Logic:**
```javascript
const getStarFill = (starNumber) => {
    const displayRating = hoverRating || rating;
    
    if (displayRating >= starNumber) return 'full';
    if (displayRating >= starNumber - 0.5) return 'half';
    return 'empty';
};

// Half star uses clip-path to show left half only
<div style={{ clipPath: 'inset(0 50% 0 0)' }}>
    <Star fill="currentColor" />
</div>
```

#### 3. Dashboard (`frontend/src/components/Dashboard/Dashboard.jsx`)
**300+ lines with detailed explanations**

**Features:**
- Fetch user's recipes
- Display in grid layout
- Delete recipes
- Loading state
- Empty state
- Date formatting

**Concepts Explained:**
- `useEffect` hook with dependencies
- `useNavigate` for routing
- Array methods (`.map()`, `.filter()`)
- Optimistic updates
- Date formatting with `toLocaleDateString()`
- Conditional rendering patterns

**useEffect Example:**
```javascript
// Runs after mount and when dependencies change
useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
        navigate('/');
        return;
    }
    
    // Fetch recipes
    fetchRecipes();
}, [isAuthenticated, navigate]); // Dependencies
```

**Optimistic Update:**
```javascript
// Remove from UI immediately, don't wait for re-fetch
setRecipes(recipes.filter(r => r.id !== recipeId));
```

---

### Updated Components ✅

#### RecipeCard.jsx
- Added `SaveRecipeButton` import
- Added `StarRating` import
- Integrated save button in header
- Passes recipe data to save button

#### App.jsx
- Added Dashboard route: `/dashboard`
- Imported Dashboard component

#### UserMenu.jsx
- Added `useNavigate` hook
- "My Recipes" now navigates to `/dashboard`

---

## File Structure

```
Foodimg2Ing/
├── __init__.py (updated - imports recipes & ratings)
├── models.py (existing - User, Recipe, Rating, Favorite)
├── auth.py (existing - authentication routes)
├── recipes.py (NEW - recipe management)
├── ratings.py (NEW - rating system)
└── utils/
    └── security.py (existing - JWT utilities)

frontend/src/
├── components/
│   ├── SaveRecipeButton.jsx (NEW)
│   ├── StarRating.jsx (NEW)
│   ├── RecipeCard.jsx (updated)
│   ├── Auth/
│   │   └── UserMenu.jsx (updated)
│   └── Dashboard/
│       └── Dashboard.jsx (NEW)
├── contexts/
│   └── AuthContext.jsx (existing)
└── App.jsx (updated)
```

---

## API Endpoints Summary

### Recipes
```
POST   /api/recipes/save              - Save recipe
GET    /api/recipes/my-recipes        - Get user's recipes
GET    /api/recipes/<id>              - Get single recipe
DELETE /api/recipes/<id>              - Delete recipe
POST   /api/recipes/<id>/favorite     - Add to favorites
DELETE /api/recipes/<id>/favorite     - Remove from favorites
GET    /api/recipes/favorites         - Get all favorites
```

### Ratings
```
POST   /api/recipes/<id>/rate         - Rate recipe
GET    /api/recipes/<id>/ratings      - Get all ratings
GET    /api/recipes/<id>/my-rating    - Get user's rating
DELETE /api/recipes/<id>/rate         - Delete rating
```

---

## Learning Highlights

### Backend Patterns

**1. Decorator Pattern:**
```python
@app.route('/api/recipes/save', methods=['POST'])
@token_required  # Ensures user is authenticated
@limiter.limit("20 per hour")  # Rate limiting
def save_recipe(user):  # user injected by decorator
    pass
```

**2. Database Queries:**
```python
# Filter and order
recipes = Recipe.query\
    .filter_by(user_id=user.id)\
    .order_by(desc(Recipe.created_at))\
    .all()

# Aggregate functions
avg_rating = db.session.query(func.avg(Rating.rating))\
    .filter(Rating.recipe_id == recipe_id)\
    .scalar()
```

**3. Error Handling:**
```python
try:
    db.session.add(recipe)
    db.session.commit()
    return jsonify({'recipe': recipe.to_dict()}), 201
except Exception as e:
    db.session.rollback()  # Undo changes
    return jsonify({'error': 'Failed'}), 500
```

### Frontend Patterns

**1. State Management:**
```javascript
// Multiple related states
const [recipes, setRecipes] = useState([]);
const [loading, setLoading] = useState(true);

// Update state
setRecipes([...recipes, newRecipe]);
```

**2. Effect Hook:**
```javascript
useEffect(() => {
    // Runs after render
    fetchData();
}, [dependency]); // Re-run when dependency changes
```

**3. Async/Await:**
```javascript
const fetchData = async () => {
    try {
        const response = await axios.get('/api/endpoint');
        setData(response.data);
    } catch (error) {
        console.error(error);
    }
};
```

---

## Testing Checklist

### Backend
- [ ] Save recipe (POST /api/recipes/save)
- [ ] Get user's recipes (GET /api/recipes/my-recipes)
- [ ] Delete recipe (DELETE /api/recipes/<id>)
- [ ] Rate recipe (POST /api/recipes/<id>/rate)
- [ ] Get ratings (GET /api/recipes/<id>/ratings)

### Frontend
- [ ] Save button appears when logged in
- [ ] Save button saves recipe
- [ ] Dashboard shows saved recipes
- [ ] Delete recipe works
- [ ] Star rating displays correctly
- [ ] Star rating hover works

---

## Next Steps (Remaining Phase 2)

- [ ] Dark mode toggle
- [ ] Dietary preferences UI
- [ ] Favorites page

---

**Implementation Date:** January 12, 2026  
**Phase:** 2B (Recipe Management)  
**Status:** ✅ Complete with Detailed Explanations
