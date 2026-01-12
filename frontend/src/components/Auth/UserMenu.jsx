import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Settings, Heart, Utensils, Moon, Sun, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext'; // New import
import { Link, useNavigate } from 'react-router-dom'; // Added Link, kept useNavigate
import PreferencesModal from './PreferencesModal'; // New import

const UserMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false); // New state
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme(); // New hook usage
    const navigate = useNavigate(); // Kept for other navigations if needed, though Link is used for dashboard
    const menuRef = useRef(null); // New ref

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const handleLogout = () => {
        setIsOpen(false); // Moved before logout
        logout();
    };

    return (
        <div className="relative" ref={menuRef}> {/* Added ref */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none" // Updated classes
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-orange-500 flex items-center justify-center text-white font-medium">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.name}
                </span>
            </button>

            <PreferencesModal // New component
                isOpen={showPreferences}
                onClose={() => setShowPreferences(false)}
            />

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                        >
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>

                            <Link // Changed from button to Link
                                to="/dashboard"
                                onClick={() => setIsOpen(false)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                            >
                                <User size={16} />
                                <span>My Recipes</span>
                            </Link>

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    // TODO: Navigate to favorites
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                            >
                                <Heart size={16} />
                                <span>Favorites</span>
                            </button>

                            <Link
                                to="/shopping-list"
                                onClick={() => setIsOpen(false)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                            >
                                <ShoppingBag size={16} />
                                <span>Shopping List</span>
                            </Link>

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setShowPreferences(true);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                            >
                                <Settings size={16} />
                                <span>Preferences</span>
                            </button>

                            <div className="border-t border-gray-100 mt-2 pt-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                >
                                    <LogOut size={16} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserMenu;
