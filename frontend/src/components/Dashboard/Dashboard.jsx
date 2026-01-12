/**
 * Dashboard Component
 * 
 * Main dashboard page for authenticated users
 * Displays user's saved recipes in a grid layout
 * 
 * Features:
 * - Fetch and display user's recipes
 * - Delete recipes
 * - View recipe details
 * - Loading and empty states
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Clock, ChefHat, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import StarRating from '../StarRating';

const Dashboard = () => {
    // ============================================================================
    // HOOKS & STATE
    // ============================================================================

    const [activeTab, setActiveTab] = useState('my_recipes'); // 'my_recipes' or 'favorites'
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState(new Set()); // Track IDs of favorited recipes

    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // ============================================================================
    // EFFECTS
    // ============================================================================

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }

        fetchData();
    }, [isAuthenticated, navigate, activeTab]); // Re-fetch when tab changes

    // ============================================================================
    // API FUNCTIONS
    // ============================================================================

    const fetchData = async () => {
        setLoading(true);
        try {
            // Always fetch favorites to know status for all recipes
            const favResponse = await axios.get('http://127.0.0.1:5000/api/recipes/favorites');
            const favIds = new Set(favResponse.data.favorites.map(f => f.recipe_id));
            setFavoriteIds(favIds);

            if (activeTab === 'my_recipes') {
                const response = await axios.get('http://127.0.0.1:5000/api/recipes/my-recipes');
                setRecipes(response.data.recipes);
            } else {
                // Flatten favorites for display
                const flattenedRecipes = favResponse.data.favorites.map(fav => ({
                    ...fav.recipe,
                    favorite_id: fav.id
                })).filter(r => r !== null);
                setRecipes(flattenedRecipes);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load recipes');
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (recipeId, e) => {
        e.stopPropagation(); // Prevent card click (navigation)

        try {
            const isFav = favoriteIds.has(recipeId);

            if (isFav) {
                // Remove from favorites
                await axios.delete(`http://127.0.0.1:5000/api/recipes/${recipeId}/favorite`);

                // Update local state
                const newFavs = new Set(favoriteIds);
                newFavs.delete(recipeId);
                setFavoriteIds(newFavs);

                // If in favorites tab, remove the card immediately
                if (activeTab === 'favorites') {
                    setRecipes(recipes.filter(r => r.id !== recipeId));
                }
                toast.success('Removed from favorites');
            } else {
                // Add to favorites
                await axios.post(`http://127.0.0.1:5000/api/recipes/${recipeId}/favorite`);

                // Update local state
                const newFavs = new Set(favoriteIds);
                newFavs.add(recipeId);
                setFavoriteIds(newFavs);
                toast.success('Added to favorites');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast.error('Failed to update favorite');
        }
    };

    const handleDelete = async (recipeId) => {
        if (!window.confirm('Are you sure you want to delete this recipe?')) return;

        try {
            await axios.delete(`http://127.0.0.1:5000/api/recipes/${recipeId}`);
            setRecipes(recipes.filter(r => r.id !== recipeId)); // Optimistic update
            toast.success('Recipe deleted successfully');
        } catch (error) {
            console.error('Error deleting recipe:', error);
            toast.error('Failed to delete recipe');
        }
    };

    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // ============================================================================
    // RENDER HELPERS
    // ============================================================================

    const renderRecipeCard = (recipe) => {
        const isFavorited = favoriteIds.has(recipe.id);

        return (
            <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-surface rounded-xl shadow-md dark:shadow-gray-900/50 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/70 transition-all border border-gray-100 dark:border-gray-700 relative group"
            >
                {/* Heart Button Overlay */}
                <button
                    onClick={(e) => toggleFavorite(recipe.id, e)}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-sm backdrop-blur-sm transition-all duration-200 ${isFavorited
                            ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/80 dark:text-red-300'
                            : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white dark:bg-black/50 dark:text-gray-300 dark:hover:text-red-400'
                        }`}
                >
                    <Heart size={18} fill={isFavorited ? "currentColor" : "none"} />
                </button>

                {/* Recipe Image */}
                <div
                    className="h-48 overflow-hidden bg-gray-200 dark:bg-gray-700 relative cursor-pointer"
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                >
                    {recipe.image_url ? (
                        <img
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ChefHat size={40} />
                        </div>
                    )}
                    {/* Public/Private Badge (Optional) */}
                    {recipe.is_public && (
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                            Public
                        </div>
                    )}
                </div>

                {/* Recipe Content */}
                <div className="p-6">
                    <h3
                        className="text-xl font-bold text-gray-900 dark:text-dark-text mb-2 line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => navigate(`/recipe/${recipe.id}`)}
                    >
                        {recipe.title}
                    </h3>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center space-x-1">
                            <Clock size={16} />
                            <span>{formatDate(recipe.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <ChefHat size={16} />
                            <span>
                                {recipe.ingredients?.length || 0} ingredient{recipe.ingredients?.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    {recipe.average_rating && (
                        <div className="mb-4">
                            <StarRating
                                rating={recipe.average_rating}
                                readonly={true}
                                showCount={true}
                                count={recipe.rating_count}
                                size={18}
                            />
                        </div>
                    )}

                    <div className="flex space-x-2">
                        <button
                            onClick={() => navigate(`/recipe/${recipe.id}`)}
                            className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm"
                        >
                            View Recipe
                        </button>
                        {/* Only show delete for My Recipes tab */}
                        {activeTab === 'my_recipes' && (
                            <button
                                onClick={() => handleDelete(recipe.id)}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                                title="Delete recipe"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    // ============================================================================
    // MAIN RENDER
    // ============================================================================

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pt-24 pb-12 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text">Dashboard</h1>
                    <p className="text-gray-600 dark:text-dark-text-secondary mt-2">
                        Welcome back, {user?.name}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white dark:bg-dark-surface p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-fit mb-8">
                    <button
                        onClick={() => setActiveTab('my_recipes')}
                        className={`
                            px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${activeTab === 'my_recipes'
                                ? 'bg-primary text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                            }
                        `}
                    >
                        My Recipes
                    </button>
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`
                            px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${activeTab === 'favorites'
                                ? 'bg-primary text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                            }
                        `}
                    >
                        Favorites
                    </button>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : recipes.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-dark-surface rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <ChefHat size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-dark-text mb-2">
                            {activeTab === 'my_recipes' ? 'No recipes yet' : 'No favorites yet'}
                        </h2>
                        <p className="text-gray-500 dark:text-dark-text-secondary mb-6 max-w-md mx-auto">
                            {activeTab === 'my_recipes'
                                ? 'Start generating recipes from your food photos!'
                                : 'Browse recipes and click the heart icon to save them here.'}
                        </p>
                        {activeTab === 'my_recipes' && (
                            <button
                                onClick={() => navigate('/')}
                                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30"
                            >
                                Generate New Recipe
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recipes.map(recipe => renderRecipeCard(recipe))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

/**
 * USAGE:
 * 
 * In App.jsx, add route:
 * 
 * import Dashboard from './components/Dashboard/Dashboard';
 * 
 * <Route path="/dashboard" element={<Dashboard />} />
 */
