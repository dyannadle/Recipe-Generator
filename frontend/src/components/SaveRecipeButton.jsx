// PURPOSE: Documentation block describing the component's role and API (props).
// WHY: Helps other developers understand how to reuse this button across the app.
// IMPACT: Fundamental UI component for user data persistence.
/**
 * SaveRecipeButton Component
 * 
 * This component provides a button to save a generated recipe to the user's account.
 */

// PURPOSE: Import React core and 'useState' hook.
// WHY: 'useState' is required to track the user's interaction (loading/saved states).
// IMPACT: Enables dynamic UI updates without page refreshes.
import React, { useState } from 'react';

// PURPOSE: Import UI icons from Lucide library.
// WHY: Visual indicators help users understand the button's function (Bookmark = Save).
// ALTERNATIVE: Use SVG paths or FontAwesome.
// IMPACT: Enhances the "premium" look and feel of the site.
import { Bookmark, BookmarkCheck } from 'lucide-react';

// PURPOSE: Import custom authentication context.
// WHY: To check if a user is logged in before allowing a save.
// IMPACT: Connects the component to the app-wide security state.
import { useAuth } from '../contexts/AuthContext';

// PURPOSE: Import Axios for making HTTP requests.
// WHY: Standard library for calling the backend API.
// ALTERNATIVE: Use native 'fetch()', but Axios has better error handling and interceptors.
// IMPACT: The bridge between the browser and the Python server.
import axios from 'axios';

// PURPOSE: Import Toast utility for pop-up notifications.
// WHY: Provides immediate feedback ("Saved!", "Login Required") without blocking the UI.
// IMPACT: Critical for a smooth User Experience (UX).
import { toast } from 'react-hot-toast';

// PURPOSE: Define the functional component with props logic.
// WHY: Prop-based components are modular and testable.
// IMPACT: Defines the API for this specific UI element.
const SaveRecipeButton = ({ recipe, onSaved }) => {
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================

    // PURPOSE: Track if the recipe has been saved in the current session.
    // WHY: To change the button's color and icon after a successful save.
    // IMPACT: Prevents duplicate saves and provides visual confirmation.
    const [isSaved, setIsSaved] = useState(false);

    // PURPOSE: Track the status of the network request.
    // WHY: To disable the button while waiting for the server, preventing double-clicks.
    // IMPACT: Improves app stability and reliability.
    const [loading, setLoading] = useState(false);

    // PURPOSE: Access shared authentication state.
    // WHY: Centralizes login logic so it doesn't have to be re-written in every component.
    // IMPACT: Enforces business rules (only members can save).
    const { isAuthenticated, user } = useAuth();

    // ============================================================================
    // SAVE RECIPE HANDLER
    // ============================================================================

    // PURPOSE: Main logic for saving a recipe.
    // WHY: Encapsulates validation, API calling, and error handling.
    // IMPACT: The engine of this component.
    const handleSave = async () => {
        // PURPOSE: Guard clause for authentication.
        // WHY: Saves server bandwidth by catching non-logged-in users locally.
        if (!isAuthenticated) {
            toast.error('Please sign in to save recipes');
            return;
        }

        // PURPOSE: Guard clause for data integrity.
        // WHY: Prevents sending garbage data to the server.
        if (!recipe || !recipe.title || !recipe.ingredients) {
            toast.error('Invalid recipe data');
            return;
        }

        // PURPOSE: Enable loading indicator.
        // IMPACT: Visually signals to the user that work is happening.
        setLoading(true);

        try {
            // PURPOSE: Execute the API call.
            // WHY: Persists the recipe data to the SQL database.
            // IMPACT: Transfers the AI-generated content into permanent user storage.
            const response = await axios.post('http://127.0.0.1:5000/api/recipes/save', {
                title: recipe.title,
                ingredients: recipe.ingredients,
                instructions: recipe.instructions || [],
                image_url: recipe.imageUrl || null
            });

            // PURPOSE: Update UI to "Saved" state.
            setIsSaved(true);

            // PURPOSE: Alert the user of success.
            toast.success('Recipe saved successfully!');

            // PURPOSE: Trigger parent callback.
            // WHY: Allows the main page to update counts or refresh lists.
            if (onSaved) {
                onSaved(response.data.recipe);
            }

        } catch (error) {
            // PURPOSE: Catch and display backend errors.
            // WHY: Users need to know WHY a save failed (e.g. "Rate limit exceeded").
            const errorMessage = error.response?.data?.error || 'Failed to save recipe';

            // PURPOSE: User-facing error alert.
            toast.error(errorMessage);

            // PURPOSE: Developer-facing error log.
            console.error('Save recipe error:', error);

        } finally {
            // PURPOSE: Reset loading state.
            // WHY: Re-enables the UI once the operation is finished (success or failure).
            // IMPACT: Ensures the button doesn't stay "stuck" in a loading state.
            setLoading(false);
        }
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    // PURPOSE: Hide the button entirely for guests.
    // WHY: Reduces UI clutter for users who can't use the feature anyway.
    // ALTERNATIVE: Show a grayed-out button with a "Sign in to save" tooltip.
    if (!isAuthenticated) {
        return null;
    }

    // PURPOSE: The actual HTML/JSX button element.
    return (
        <button
            // PURPOSE: Attach the click handler.
            onClick={handleSave}
            // PURPOSE: Disable interaction when busy or done.
            disabled={loading || isSaved}
            // PURPOSE: Dynamic Tailwind CSS classes for styling.
            // WHY: Allows complex state-based styling (colors, transitions) without external CSS files.
            // IMPACT: High-quality, responsive visual design.
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
            // PURPOSE: Accessibility tooltip for screen readers.
            title={isSaved ? 'Recipe saved' : 'Save recipe to your account'}
        >
            {/* PURPOSE: Select icon based on state. */}
            {isSaved ? (
                <BookmarkCheck size={20} />
            ) : (
                <Bookmark size={20} />
            )}

            {/* PURPOSE: Display dynamic text. */}
            <span>
                {loading ? 'Saving...' : (isSaved ? 'Saved' : 'Save Recipe')}
            </span>
        </button>
    );
};

// PURPOSE: Export for modular reuse.
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
