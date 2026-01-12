/**
 * SaveRecipeButton Component
 * 
 * This component provides a button to save a generated recipe to the user's account.
 * It handles authentication checks, API calls, and user feedback.
 * 
 * Props:
 * - recipe: Object containing { title, ingredients, instructions, imageUrl }
 * - onSaved: Callback function called after successful save (optional)
 */

import React, { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const SaveRecipeButton = ({ recipe, onSaved }) => {
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================

    /**
     * isSaved: Boolean tracking if this recipe is already saved
     * We start with false and update it after save
     */
    const [isSaved, setIsSaved] = useState(false);

    /**
     * loading: Boolean tracking if save operation is in progress
     * Used to disable button and show loading state
     */
    const [loading, setLoading] = useState(false);

    /**
     * Get authentication context
     * isAuthenticated: Boolean - is user logged in?
     * user: Object - current user data (or null)
     */
    const { isAuthenticated, user } = useAuth();

    // ============================================================================
    // SAVE RECIPE HANDLER
    // ============================================================================

    /**
     * handleSave - Async function to save recipe to database
     * 
     * Flow:
     * 1. Check if user is authenticated
     * 2. Validate recipe data
     * 3. Make POST request to backend
     * 4. Handle success/error
     * 5. Update UI state
     */
    const handleSave = async () => {
        // STEP 1: Authentication Check
        // If user is not logged in, show toast and return early
        if (!isAuthenticated) {
            toast.error('Please sign in to save recipes');
            return; // Exit function early
        }

        // STEP 2: Validation
        // Ensure we have minimum required data
        if (!recipe || !recipe.title || !recipe.ingredients) {
            toast.error('Invalid recipe data');
            return;
        }

        // STEP 3: Set loading state
        // This disables the button and shows loading indicator
        setLoading(true);

        try {
            // STEP 4: Make API Request
            /**
             * axios.post() sends HTTP POST request
             * First argument: URL endpoint
             * Second argument: Request body (data to send)
             * 
             * The Authorization header is automatically added by AuthContext
             * via axios interceptor (see AuthContext.jsx)
             */
            const response = await axios.post('http://127.0.0.1:5000/api/recipes/save', {
                title: recipe.title,
                ingredients: recipe.ingredients,
                instructions: recipe.instructions || [],
                image_url: recipe.imageUrl || null
            });

            // STEP 5: Handle Success
            /**
             * If we get here, the request succeeded (status 2xx)
             * response.data contains the server's JSON response
             */

            // Update saved state
            setIsSaved(true);

            // Show success message to user
            toast.success('Recipe saved successfully!');

            // Call optional callback if provided
            // This allows parent component to react to save
            if (onSaved) {
                onSaved(response.data.recipe);
            }

        } catch (error) {
            // STEP 6: Handle Errors
            /**
             * Errors can occur for many reasons:
             * - Network failure
             * - Server error (500)
             * - Validation error (400)
             * - Authentication error (401)
             */

            // Extract error message from response
            // Use optional chaining (?.) to safely access nested properties
            const errorMessage = error.response?.data?.error || 'Failed to save recipe';

            // Show error to user
            toast.error(errorMessage);

            // Log full error for debugging
            console.error('Save recipe error:', error);

        } finally {
            // STEP 7: Cleanup
            /**
             * finally block runs whether try succeeded or failed
             * Perfect for cleanup operations like resetting loading state
             */
            setLoading(false);
        }
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    /**
     * Conditional rendering based on authentication and save state
     */

    // Don't show button if user is not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <button
            onClick={handleSave}
            disabled={loading || isSaved}  // Disable if loading or already saved
            className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium
                transition-all duration-200
                ${isSaved
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-primary text-white hover:bg-red-500'
                }
                ${loading ? 'opacity-50 cursor-wait' : ''}
                disabled:opacity-50 disabled:cursor-not-allowed
            `}
            title={isSaved ? 'Recipe saved' : 'Save recipe to your account'}
        >
            {/* 
                Conditional Icon Rendering
                - BookmarkCheck (filled) when saved
                - Bookmark (outline) when not saved
            */}
            {isSaved ? (
                <BookmarkCheck size={20} />
            ) : (
                <Bookmark size={20} />
            )}

            {/* 
                Conditional Text
                Shows different text based on state
            */}
            <span>
                {loading ? 'Saving...' : (isSaved ? 'Saved' : 'Save Recipe')}
            </span>
        </button>
    );
};

export default SaveRecipeButton;

/**
 * USAGE EXAMPLE:
 * 
 * import SaveRecipeButton from './SaveRecipeButton';
 * 
 * function RecipeDisplay() {
 *     const recipe = {
 *         title: "Chocolate Cake",
 *         ingredients: ["flour", "sugar", "cocoa"],
 *         instructions: ["Mix", "Bake"],
 *         imageUrl: "https://..."
 *     };
 * 
 *     return (
 *         <div>
 *             <h1>{recipe.title}</h1>
 *             <SaveRecipeButton 
 *                 recipe={recipe}
 *                 onSaved={(savedRecipe) => {
 *                     console.log('Recipe saved with ID:', savedRecipe.id);
 *                 }}
 *             />
 *         </div>
 *     );
 * }
 */
