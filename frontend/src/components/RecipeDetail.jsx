import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Clock, ChefHat, Heart, Share2, ArrowLeft, Printer, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import StarRating from './StarRating';
import NutritionLabel from './NutritionLabel';


const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [nutrition, setNutrition] = useState(null);

    // Fetch Recipe Data
    useEffect(() => {
        const fetchRecipeData = async () => {
            try {
                // 1. Get Recipe Details
                const recipeRes = await axios.get(`http://127.0.0.1:5000/api/recipes/${id}`);
                setRecipe(recipeRes.data.recipe);

                // Fetch Nutrition
                try {
                    const nutRes = await axios.get(`http://127.0.0.1:5000/api/recipes/${id}/nutrition`);
                    setNutrition(nutRes.data.nutrition);
                } catch (e) {
                    console.log('Nutrition not available');
                }

                // 2. If logged in, check if favorited and get user's rating
                if (isAuthenticated) {
                    try {
                        const favoritesRes = await axios.get('http://127.0.0.1:5000/api/recipes/favorites');
                        const favorites = favoritesRes.data.favorites;
                        const isFav = favorites.some(fav => fav.recipe.id === parseInt(id));
                        setIsFavorited(isFav);

                        const ratingRes = await axios.get(`http://127.0.0.1:5000/api/recipes/${id}/my-rating`);
                        setUserRating(ratingRes.data.rating?.rating || 0);

                    } catch (err) {
                        console.warn('Could not fetch user interactions', err);
                    }
                }
            } catch (err) {
                console.error('Error loading recipe:', err);
                setError('Recipe not found or access denied');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipeData();
    }, [id, isAuthenticated]);

    // Handle Favorite Toggle
    const toggleFavorite = async () => {
        if (!isAuthenticated) return toast.error('Please login to save favorites');

        try {
            if (isFavorited) {
                await axios.delete(`http://127.0.0.1:5000/api/recipes/${id}/favorite`);
                toast.success('Removed from favorites');
            } else {
                await axios.post(`http://127.0.0.1:5000/api/recipes/${id}/favorite`);
                toast.success('Added to favorites');
            }
            setIsFavorited(!isFavorited);
        } catch (err) {
            toast.error('Failed to update favorites');
        }
    };

    // Handle Rating
    const handleRate = async (rating) => {
        if (!isAuthenticated) return toast.error('Please login to rate');

        try {
            await axios.post(`http://127.0.0.1:5000/api/recipes/${id}/rate`, { rating });
            setUserRating(rating);
            toast.success('Rating saved!');

            // Refresh recipe to update average
            const recipeRes = await axios.get(`http://127.0.0.1:5000/api/recipes/${id}`);
            setRecipe(recipeRes.data.recipe);
        } catch (err) {
            toast.error('Failed to save rating');
        }
    };

    const addToShoppingList = async () => {
        if (!isAuthenticated) return toast.error('Please login');
        try {
            const res = await axios.post('http://127.0.0.1:5000/api/shopping-list/add-recipe', { recipe_id: id });
            toast.success(res.data.message);
        } catch (error) {
            toast.error('Failed to add to shopping list');
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-24 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen pt-24 text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Oops!</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button onClick={() => navigate('/')} className="mt-4 text-primary hover:underline">
                Go Home
            </button>
        </div>
    );

    if (!recipe) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200 pt-20 pb-12"
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>

                <article className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">

                    {/* Hero Image */}
                    <div className="h-64 sm:h-96 w-full relative">
                        {recipe.image_url ? (
                            <img
                                src={recipe.image_url}
                                alt={recipe.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <ChefHat size={64} className="text-gray-400" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <h1 className="absolute bottom-6 left-6 right-6 text-3xl sm:text-4xl font-bold text-white shadow-sm">
                            {recipe.title}
                        </h1>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center space-x-2">
                                <Clock size={18} />
                                <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <ChefHat size={18} />
                                <span>{recipe.ingredients.length} Ingredients</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={toggleFavorite}
                                className={`p-2 rounded-full transition-all ${isFavorited
                                    ? 'bg-red-50 text-red-500 dark:bg-red-900/20'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                                    }`}
                                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                            >
                                <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
                            </button>
                            <button className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors">
                                <Share2 size={20} />
                            </button>
                            <button className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors">
                                <Printer size={20} />
                            </button>
                            <button
                                onClick={addToShoppingList}
                                className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors"
                                title="Add to Shopping List"
                            >
                                <ShoppingBag size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 sm:p-10 grid gap-10 lg:grid-cols-3">

                        {/* Left Column: Ingredients & Rating */}
                        <div className="lg:col-span-1 space-y-8">

                            {/* Rating Section */}
                            <section className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Rate this recipe</h3>
                                <div className="flex justify-center">
                                    <StarRating
                                        rating={userRating}
                                        onRate={handleRate}
                                        size={28}
                                    />
                                </div>
                                <p className="text-center text-sm text-gray-500 mt-2">
                                    Average: {recipe.average_rating ? recipe.average_rating.toFixed(1) : 'New'}
                                    ({recipe.rating_count} ratings)
                                </p>
                            </section>

                            {/* Ingredients List */}
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                                    Ingredients
                                </h3>
                                <ul className="space-y-3">
                                    {recipe.ingredients.map((ing, i) => (
                                        <li key={i} className="flex items-start space-x-3 text-gray-700 dark:text-gray-300">
                                            <span className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                                            <span>{ing}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            {/* Nutrition Label */}
                            {nutrition && (
                                <section className="mt-8">
                                    <NutritionLabel nutrition={nutrition} />
                                </section>
                            )}
                        </div>

                        {/* Right Column: Instructions */}
                        <div className="lg:col-span-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">
                                Instructions
                            </h3>
                            <div className="space-y-6">
                                {recipe.instructions && recipe.instructions.length > 0 ? (
                                    recipe.instructions.map((step, i) => (
                                        <div key={i} className="flex">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm mr-4 mt-1">
                                                {i + 1}
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                                                {step}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg">
                                        No specific instructions provided. Use the ingredients list to prepare this dish.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </article>
            </div>
        </motion.div>
    );
};

export default RecipeDetail;
