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
import { Trash2, Clock, ChefHat } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import StarRating from '../StarRating';

const Dashboard = () => {
    // ============================================================================
    // HOOKS & STATE
    // ============================================================================

    /**
     * recipes: Array of user's saved recipes
     * Initially empty array, populated after API call
     */
    const [recipes, setRecipes] = useState([]);

    /**
     * loading: Boolean indicating if data is being fetched
     * Used to show loading spinner
     */
    const [loading, setLoading] = useState(true);

    /**
     * Get authentication context
     * user: Current user object
     * isAuthenticated: Boolean
     */
    const { user, isAuthenticated } = useAuth();

    /**
     * navigate: Function from react-router to programmatically navigate
     * Used to redirect if user is not authenticated
     */
    const navigate = useNavigate();

    // ============================================================================
    // EFFECTS
    // ============================================================================

    /**
     * useEffect: Runs after component mounts and when dependencies change
     * 
     * Dependencies: [isAuthenticated, navigate]
     * - Runs when component first renders
     * - Runs again if isAuthenticated or navigate changes
     */
    useEffect(() => {
        /**
         * Authentication Check
         * If user is not logged in, redirect to home page
         */
        if (!isAuthenticated) {
            navigate('/');
            return; // Exit early
        }

        /**
         * Fetch user's recipes
         * Call async function defined below
         */
        fetchRecipes();
    }, [isAuthenticated, navigate]); // Dependency array

    // ============================================================================
    // API FUNCTIONS
    // ============================================================================

    /**
     * fetchRecipes - Fetch user's saved recipes from backend
     * 
     * Flow:
     * 1. Set loading state
     * 2. Make GET request to backend
     * 3. Update recipes state with response
     * 4. Handle errors
     * 5. Clear loading state
     */
    const fetchRecipes = async () => {
        setLoading(true);

        try {
            /**
             * axios.get() sends HTTP GET request
             * Authorization header is automatically added by AuthContext
             */
            const response = await axios.get('http://127.0.0.1:5000/api/recipes/my-recipes');

            /**
             * response.data.recipes contains array of recipe objects
             * Each recipe has: id, title, ingredients, instructions, created_at, etc.
             */
            setRecipes(response.data.recipes);

        } catch (error) {
            // Log error for debugging
            console.error('Error fetching recipes:', error);

            // Show error toast to user
            toast.error('Failed to load recipes');

            // Set empty array on error
            setRecipes([]);

        } finally {
            // Always runs, whether try succeeded or failed
            setLoading(false);
        }
    };

    /**
     * handleDelete - Delete a recipe
     * 
     * @param {number} recipeId - ID of recipe to delete
     * 
     * Flow:
     * 1. Show confirmation dialog
     * 2. If confirmed, make DELETE request
     * 3. Remove recipe from local state (optimistic update)
     * 4. Show success message
     */
    const handleDelete = async (recipeId) => {
        /**
         * window.confirm() shows browser confirmation dialog
         * Returns true if user clicks OK, false if Cancel
         */
        if (!window.confirm('Are you sure you want to delete this recipe?')) {
            return; // User cancelled
        }

        try {
            /**
             * axios.delete() sends HTTP DELETE request
             * Template literal: `string ${variable}` embeds variable in string
             */
            await axios.delete(`http://127.0.0.1:5000/api/recipes/${recipeId}`);

            /**
             * Optimistic Update: Remove recipe from UI immediately
             * Don't wait for re-fetch, just filter it out
             * 
             * .filter() creates new array with items that pass test
             * r.id !== recipeId keeps all recipes EXCEPT the deleted one
             */
            setRecipes(recipes.filter(r => r.id !== recipeId));

            // Show success message
            toast.success('Recipe deleted successfully');

        } catch (error) {
            console.error('Error deleting recipe:', error);
            toast.error('Failed to delete recipe');
        }
    };

    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================

    /**
     * formatDate - Format ISO date string to readable format
     * 
     * @param {string} dateString - ISO date string (e.g., "2024-01-12T10:30:00")
     * @returns {string} - Formatted date (e.g., "Jan 12, 2024")
     */
    const formatDate = (dateString) => {
        /**
         * new Date() creates Date object from string
         * toLocaleDateString() converts to locale-specific format
         * 
         * Options:
         * - year: 'numeric' → "2024"
         * - month: 'short' → "Jan"
         * - day: 'numeric' → "12"
         */
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // ============================================================================
    // RENDER HELPERS
    // ============================================================================

    /**
     * renderRecipeCard - Render a single recipe card
     * 
     * @param {object} recipe - Recipe object from API
     */
    const renderRecipeCard = (recipe) => (
        <motion.div
            key={recipe.id}  // Unique key for React list rendering
            initial={{ opacity: 0, y: 20 }}  // Start state (invisible, below)
            animate={{ opacity: 1, y: 0 }}   // End state (visible, in place)
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
            {/* Recipe Image */}
            {recipe.image_url && (
                <div className="h-48 overflow-hidden bg-gray-200">
                    <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Recipe Content */}
            <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {recipe.title}
                </h3>

                {/* Metadata Row */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    {/* Date */}
                    <div className="flex items-center space-x-1">
                        <Clock size={16} />
                        <span>{formatDate(recipe.created_at)}</span>
                    </div>

                    {/* Ingredient Count */}
                    <div className="flex items-center space-x-1">
                        <ChefHat size={16} />
                        <span>
                            {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Rating */}
                {recipe.average_rating && (
                    <div className="mb-4">
                        <StarRating
                            rating={recipe.average_rating}
                            readonly={true}
                            showCount={true}
                            count={recipe.rating_count}
                            size={20}
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                    {/* View Button */}
                    <button
                        onClick={() => {
                            // TODO: Navigate to recipe detail page
                            toast.info('Recipe detail view coming soon!');
                        }}
                        className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors"
                    >
                        View Recipe
                    </button>

                    {/* Delete Button */}
                    <button
                        onClick={() => handleDelete(recipe.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete recipe"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );

    // ============================================================================
    // MAIN RENDER
    // ============================================================================

    /**
     * Conditional Rendering:
     * 1. If loading: Show spinner
     * 2. If no recipes: Show empty state
     * 3. Otherwise: Show recipe grid
     */

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pt-24 pb-12 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text">
                        My Recipes
                    </h1>
                    <p className="text-gray-600 dark:text-dark-text-secondary mt-2">
                        {user?.name}, you have {recipes.length} saved recipe{recipes.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && recipes.length === 0 && (
                    <div className="text-center py-20">
                        <ChefHat size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-dark-text mb-2">
                            No recipes yet
                        </h2>
                        <p className="text-gray-500 dark:text-dark-text-secondary mb-6">
                            Start generating recipes and save your favorites!
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-500 transition-colors"
                        >
                            Generate Recipe
                        </button>
                    </div>
                )}

                {/* Recipe Grid */}
                {!loading && recipes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/**
                         * .map() iterates over recipes array
                         * For each recipe, call renderRecipeCard()
                         * Returns array of JSX elements
                         */}
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
