/**
 * StarRating Component
 * 
 * Interactive star rating component (1-5 stars)
 * Can be used in two modes:
 * 1. Display mode: Shows average rating (read-only)
 * 2. Input mode: Allows user to select rating (interactive)
 * 
 * Props:
 * - rating: Number (0-5) - Current rating value
 * - onRate: Function - Callback when user selects a rating (optional)
 * - readonly: Boolean - If true, stars are not clickable (default: false)
 * - size: Number - Size of stars in pixels (default: 24)
 * - showCount: Boolean - Show rating count next to stars (default: false)
 * - count: Number - Number of ratings (used with showCount)
 */

import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
    rating = 0,           // Default to 0 if not provided
    onRate,               // Optional callback function
    readonly = false,     // Default to interactive
    size = 24,            // Default star size
    showCount = false,    // Default to not showing count
    count = 0             // Default count
}) => {
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================

    /**
     * hoverRating: Tracks which star user is hovering over
     * Used to show preview of rating before clicking
     * null when not hovering
     */
    const [hoverRating, setHoverRating] = useState(null);

    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================

    /**
     * handleClick - Called when user clicks a star
     * 
     * @param {number} selectedRating - The star number clicked (1-5)
     */
    const handleClick = (selectedRating) => {
        // Only trigger if:
        // 1. Not in readonly mode
        // 2. onRate callback is provided
        if (!readonly && onRate) {
            onRate(selectedRating);
        }
    };

    /**
     * handleMouseEnter - Called when mouse enters a star
     * Shows preview of what rating would be if clicked
     * 
     * @param {number} starNumber - The star being hovered (1-5)
     */
    const handleMouseEnter = (starNumber) => {
        if (!readonly) {
            setHoverRating(starNumber);
        }
    };

    /**
     * handleMouseLeave - Called when mouse leaves star area
     * Clears the hover preview
     */
    const handleMouseLeave = () => {
        setHoverRating(null);
    };

    /**
     * getStarFill - Determines how much of a star should be filled
     * 
     * Handles partial stars for decimal ratings (e.g., 3.5 stars)
     * 
     * @param {number} starNumber - Which star (1-5)
     * @returns {string} - 'full', 'half', or 'empty'
     */
    const getStarFill = (starNumber) => {
        /**
         * displayRating: The rating to display
         * Use hoverRating if hovering (preview)
         * Otherwise use actual rating
         */
        const displayRating = hoverRating !== null ? hoverRating : rating;

        /**
         * Logic:
         * - If displayRating >= starNumber: Star is fully filled
         * - If displayRating >= starNumber - 0.5: Star is half filled
         * - Otherwise: Star is empty
         * 
         * Example with rating = 3.5:
         * - Star 1: 3.5 >= 1 → full
         * - Star 2: 3.5 >= 2 → full
         * - Star 3: 3.5 >= 3 → full
         * - Star 4: 3.5 >= 3.5 → half (3.5 >= 4 - 0.5)
         * - Star 5: 3.5 < 4.5 → empty
         */
        if (displayRating >= starNumber) {
            return 'full';
        } else if (displayRating >= starNumber - 0.5) {
            return 'half';
        } else {
            return 'empty';
        }
    };

    // ============================================================================
    // RENDER HELPERS
    // ============================================================================

    /**
     * renderStar - Renders a single star with appropriate fill
     * 
     * @param {number} starNumber - Which star to render (1-5)
     */
    const renderStar = (starNumber) => {
        const fill = getStarFill(starNumber);

        /**
         * Color logic:
         * - Hovering: Use orange (preview color)
         * - Full/Half: Use yellow (active color)
         * - Empty: Use gray (inactive color)
         */
        const color = hoverRating !== null
            ? 'text-orange-400'  // Preview color
            : fill !== 'empty'
                ? 'text-yellow-400'  // Active color
                : 'text-gray-300';   // Inactive color

        return (
            <button
                key={starNumber}
                type="button"
                onClick={() => handleClick(starNumber)}
                onMouseEnter={() => handleMouseEnter(starNumber)}
                onMouseLeave={handleMouseLeave}
                disabled={readonly}
                className={`
                    relative inline-block
                    ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
                    transition-transform duration-150
                    ${readonly ? '' : 'focus:outline-none focus:ring-2 focus:ring-primary/50 rounded'}
                `}
                aria-label={`Rate ${starNumber} star${starNumber > 1 ? 's' : ''}`}
            >
                {/* 
                    HALF STAR IMPLEMENTATION
                    We use CSS clip-path to show half of the star
                */}
                {fill === 'half' ? (
                    <div className="relative">
                        {/* Background (empty) star */}
                        <Star
                            size={size}
                            className="text-gray-300"
                            fill="currentColor"
                        />
                        {/* Foreground (half-filled) star */}
                        <div
                            className="absolute inset-0 overflow-hidden"
                            style={{ clipPath: 'inset(0 50% 0 0)' }}  // Show left half only
                        >
                            <Star
                                size={size}
                                className="text-yellow-400"
                                fill="currentColor"
                            />
                        </div>
                    </div>
                ) : (
                    /* FULL OR EMPTY STAR */
                    <Star
                        size={size}
                        className={color}
                        fill={fill === 'full' ? 'currentColor' : 'none'}  // Fill if full, outline if empty
                    />
                )}
            </button>
        );
    };

    // ============================================================================
    // MAIN RENDER
    // ============================================================================

    return (
        <div className="flex items-center space-x-1">
            {/* 
                Render 5 stars
                Array(5) creates array of 5 undefined elements
                .fill(0) fills with 0
                .map((_, i) => ...) iterates with index
                i + 1 gives us star numbers 1-5
            */}
            <div className="flex items-center">
                {Array(5).fill(0).map((_, i) => renderStar(i + 1))}
            </div>

            {/* 
                Optional: Show rating number and count
                Example: "4.5 (23 ratings)"
            */}
            {showCount && (
                <span className="text-sm text-gray-600 ml-2">
                    {/* 
                        toFixed(1) rounds to 1 decimal place
                        Example: 4.567 → "4.6"
                    */}
                    {rating > 0 ? rating.toFixed(1) : 'No ratings'}
                    {count > 0 && (
                        <span className="text-gray-400">
                            {' '}({count} {count === 1 ? 'rating' : 'ratings'})
                        </span>
                    )}
                </span>
            )}
        </div>
    );
};

export default StarRating;

/**
 * USAGE EXAMPLES:
 * 
 * // 1. Display Mode (Read-only)
 * <StarRating 
 *     rating={4.5} 
 *     readonly={true}
 *     showCount={true}
 *     count={23}
 * />
 * 
 * // 2. Input Mode (Interactive)
 * function RatingForm() {
 *     const [userRating, setUserRating] = useState(0);
 * 
 *     return (
 *         <div>
 *             <p>Rate this recipe:</p>
 *             <StarRating 
 *                 rating={userRating}
 *                 onRate={(rating) => {
 *                     setUserRating(rating);
 *                     console.log('User rated:', rating);
 *                 }}
 *             />
 *         </div>
 *     );
 * }
 * 
 * // 3. Large Stars
 * <StarRating 
 *     rating={5} 
 *     size={32}
 *     readonly={true}
 * />
 */
