/**
 * Tailwind CSS Configuration
 * 
 * This file configures Tailwind CSS for the Recipe Generator app
 * Includes dark mode support and custom theme colors
 */

/** @type {import('tailwindcss').Config} */
export default {
    // ============================================================================
    // CONTENT PATHS
    // ============================================================================

    /**
     * Specify which files Tailwind should scan for class names
     * Tailwind will only include CSS for classes found in these files
     * This keeps the final CSS bundle small
     */
    content: [
        "./index.html",                    // Main HTML file
        "./src/**/*.{js,ts,jsx,tsx}",     // All JS/TS/JSX/TSX files in src
    ],

    // ============================================================================
    // DARK MODE CONFIGURATION
    // ============================================================================

    /**
     * darkMode: 'class'
     * 
     * This tells Tailwind to use class-based dark mode
     * Dark mode is enabled when 'dark' class is present on <html> element
     * 
     * How it works:
     * 1. ThemeContext adds/removes 'dark' class on <html>
     * 2. Tailwind applies dark: variants when class is present
     * 
     * Example:
     * <div className="bg-white dark:bg-gray-900">
     *   - Light mode: bg-white
     *   - Dark mode: bg-gray-900 (when <html class="dark">)
     * 
     * Alternative: darkMode: 'media'
     * - Uses system preference (prefers-color-scheme)
     * - Can't be toggled by user
     * - We use 'class' for manual control
     */
    darkMode: 'class',

    // ============================================================================
    // THEME CUSTOMIZATION
    // ============================================================================

    theme: {
        extend: {
            /**
             * Custom colors for the app
             * These can be used like: bg-primary, text-primary, etc.
             */
            colors: {
                primary: '#dc2626',      // Red-600 (main brand color)
                secondary: '#f97316',    // Orange-500 (accent color)

                // Dark mode specific colors
                dark: {
                    bg: '#0F172A',         // Slate-900 (dark background)
                    surface: '#1E293B',    // Slate-800 (dark cards/surfaces)
                    border: '#334155',     // Slate-700 (dark borders)
                    text: '#E2E8F0',       // Slate-200 (dark text)
                    'text-secondary': '#94A3B8',  // Slate-400 (dark secondary text)
                }
            },

            /**
             * Custom font family
             * Uses system fonts for best performance
             */
            fontFamily: {
                sans: [
                    'Inter',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'Roboto',
                    'sans-serif'
                ],
            },

            /**
             * Custom animations
             * Can be used with animate-{name}
             */
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },

    // ============================================================================
    // PLUGINS
    // ============================================================================

    /**
     * Tailwind plugins extend functionality
     * Add plugins here as needed
     */
    plugins: [],
}

/**
 * USING DARK MODE IN COMPONENTS:
 * 
 * Basic usage:
 * <div className="bg-white dark:bg-gray-900">
 *   Content
 * </div>
 * 
 * Multiple properties:
 * <div className="
 *   bg-white dark:bg-gray-900
 *   text-gray-900 dark:text-white
 *   border-gray-200 dark:border-gray-700
 * ">
 *   Content
 * </div>
 * 
 * With hover states:
 * <button className="
 *   bg-white dark:bg-gray-800
 *   hover:bg-gray-100 dark:hover:bg-gray-700
 * ">
 *   Button
 * </button>
 * 
 * Custom dark colors:
 * <div className="bg-dark-surface text-dark-text">
 *   Uses custom dark colors defined above
 * </div>
 */
