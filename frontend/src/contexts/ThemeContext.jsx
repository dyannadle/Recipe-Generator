/**
 * ThemeContext - Dark Mode Management
 * 
 * This context provides dark mode functionality across the entire app.
 * It manages theme state, persists to localStorage, and applies CSS classes.
 * 
 * How Dark Mode Works:
 * 1. Store theme preference in localStorage
 * 2. Apply 'dark' class to document root
 * 3. Use Tailwind's dark: variants for styling
 * 
 * Example: className="bg-white dark:bg-gray-900"
 * - Light mode: bg-white
 * - Dark mode: bg-gray-900
 */

import React, { createContext, useState, useContext, useEffect } from 'react';

// ============================================================================
// CREATE CONTEXT
// ============================================================================

/**
 * Create context with default value of null
 * This will hold theme state and toggle function
 */
const ThemeContext = createContext(null);

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * useTheme - Custom hook to access theme context
 * 
 * Usage:
 * const { theme, toggleTheme } = useTheme();
 * 
 * @returns {object} - { theme: 'light'|'dark', toggleTheme: function }
 * @throws {Error} - If used outside ThemeProvider
 */
export const useTheme = () => {
    // Get context value
    const context = useContext(ThemeContext);

    // Error if context is null (used outside provider)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }

    return context;
};

// ============================================================================
// THEME PROVIDER COMPONENT
// ============================================================================

/**
 * ThemeProvider - Wraps app to provide theme context
 * 
 * @param {object} props - Component props
 * @param {ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
    // ========================================================================
    // STATE INITIALIZATION
    // ========================================================================

    /**
     * Initialize theme from localStorage or system preference
     * 
     * Priority:
     * 1. localStorage value (user's previous choice)
     * 2. System preference (prefers-color-scheme)
     * 3. Default to 'light'
     */
    const [theme, setTheme] = useState(() => {
        // Try to get saved preference from localStorage
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme) {
            // User has a saved preference
            return savedTheme;
        }

        // Check system preference
        // window.matchMedia() checks CSS media query
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        // Default to light
        return 'light';
    });

    // ========================================================================
    // EFFECTS
    // ========================================================================

    /**
     * Effect: Apply theme class to document root
     * 
     * Runs when theme changes
     * 
     * How it works:
     * - Add 'dark' class to <html> element when dark mode
     * - Remove 'dark' class when light mode
     * - Tailwind uses this class to apply dark: variants
     */
    useEffect(() => {
        // Get root element (<html>)
        const root = document.documentElement;

        if (theme === 'dark') {
            // Add dark class
            // classList.add() adds class if not present
            root.classList.add('dark');
        } else {
            // Remove dark class
            // classList.remove() removes class if present
            root.classList.remove('dark');
        }

        // Save to localStorage for persistence
        // Next time user visits, theme will be remembered
        localStorage.setItem('theme', theme);

    }, [theme]); // Dependency: re-run when theme changes

    // ========================================================================
    // TOGGLE FUNCTION
    // ========================================================================

    /**
     * toggleTheme - Switch between light and dark mode
     * 
     * Uses functional update form of setState
     * prevTheme => newTheme ensures we always toggle correctly
     */
    const toggleTheme = () => {
        setTheme(prevTheme => {
            // If currently light, switch to dark
            // If currently dark, switch to light
            return prevTheme === 'light' ? 'dark' : 'light';
        });
    };

    // ========================================================================
    // CONTEXT VALUE
    // ========================================================================

    /**
     * Value object provided to all consumers
     * Contains current theme and toggle function
     */
    const value = {
        theme,        // Current theme: 'light' or 'dark'
        toggleTheme,  // Function to toggle theme
        isDark: theme === 'dark'  // Convenience boolean
    };

    // ========================================================================
    // RENDER
    // ========================================================================

    /**
     * Provider makes value available to all children
     * Any component can access theme via useTheme() hook
     */
    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * USAGE EXAMPLE:
 * 
 * // 1. Wrap app with ThemeProvider (in main.jsx or App.jsx)
 * import { ThemeProvider } from './contexts/ThemeContext';
 * 
 * function App() {
 *     return (
 *         <ThemeProvider>
 *             <YourApp />
 *         </ThemeProvider>
 *     );
 * }
 * 
 * // 2. Use theme in any component
 * import { useTheme } from './contexts/ThemeContext';
 * 
 * function MyComponent() {
 *     const { theme, toggleTheme, isDark } = useTheme();
 * 
 *     return (
 *         <div className="bg-white dark:bg-gray-900">
 *             <p>Current theme: {theme}</p>
 *             <button onClick={toggleTheme}>
 *                 Toggle to {isDark ? 'light' : 'dark'} mode
 *             </button>
 *         </div>
 *     );
 * }
 * 
 * // 3. Tailwind CSS dark mode variants
 * // In any component, use dark: prefix for dark mode styles
 * <div className="
 *     bg-white dark:bg-gray-900
 *     text-gray-900 dark:text-white
 *     border-gray-200 dark:border-gray-700
 * ">
 *     Content adapts to theme automatically
 * </div>
 */

/**
 * TAILWIND CONFIGURATION:
 * 
 * In tailwind.config.js, ensure dark mode is enabled:
 * 
 * module.exports = {
 *     darkMode: 'class',  // Use 'dark' class on html element
 *     // ... rest of config
 * }
 */
