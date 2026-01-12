/**
 * ThemeToggle Component
 * 
 * A button to toggle between light and dark mode
 * Shows sun icon in dark mode, moon icon in light mode
 * Includes smooth transition animation
 */

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
    // ============================================================================
    // GET THEME CONTEXT
    // ============================================================================

    /**
     * Access theme state and toggle function from context
     * isDark: boolean - true if current theme is dark
     * toggleTheme: function - switches between light/dark
     */
    const { isDark, toggleTheme } = useTheme();

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <button
            onClick={toggleTheme}
            className="
                relative p-2 rounded-lg
                bg-gray-100 dark:bg-gray-800
                hover:bg-gray-200 dark:hover:bg-gray-700
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-primary/50
            "
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {/* 
                CONDITIONAL ICON RENDERING
                
                Show Sun icon when in dark mode (switch to light)
                Show Moon icon when in light mode (switch to dark)
                
                Icons have smooth rotation animation on theme change
            */}
            <div className="relative w-5 h-5">
                {/* Sun Icon (visible in dark mode) */}
                <Sun
                    size={20}
                    className={`
                        absolute inset-0
                        text-yellow-500
                        transition-all duration-300
                        ${isDark
                            ? 'opacity-100 rotate-0'      // Visible, no rotation
                            : 'opacity-0 rotate-180'      // Hidden, rotated
                        }
                    `}
                />

                {/* Moon Icon (visible in light mode) */}
                <Moon
                    size={20}
                    className={`
                        absolute inset-0
                        text-gray-700 dark:text-gray-300
                        transition-all duration-300
                        ${isDark
                            ? 'opacity-0 -rotate-180'     // Hidden, rotated
                            : 'opacity-100 rotate-0'      // Visible, no rotation
                        }
                    `}
                />
            </div>
        </button>
    );
};

export default ThemeToggle;

/**
 * USAGE:
 * 
 * import ThemeToggle from './components/ThemeToggle';
 * 
 * function Navbar() {
 *     return (
 *         <nav>
 *             <div>Logo</div>
 *             <div>Links</div>
 *             <ThemeToggle />  // Add toggle button
 *         </nav>
 *     );
 * }
 */

/**
 * CSS TRANSITIONS EXPLAINED:
 * 
 * transition-all duration-300:
 * - Animates all properties (opacity, rotation)
 * - Over 300ms
 * 
 * opacity-100 / opacity-0:
 * - Fully visible / fully hidden
 * 
 * rotate-0 / rotate-180 / -rotate-180:
 * - No rotation / 180° clockwise / 180° counter-clockwise
 * - Creates smooth spin effect when toggling
 * 
 * absolute inset-0:
 * - Position both icons in same space
 * - Only one visible at a time
 * - Prevents layout shift during transition
 */
