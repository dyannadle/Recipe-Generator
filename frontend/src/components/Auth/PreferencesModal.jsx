/**
 * PreferencesModal Component
 * 
 * This component provides a form for users to update their dietary preferences.
 * It includes settings for:
 * - Dietary Type (Vegan, Vegetarian, etc.)
 * - Allergies (Multi-select)
 * - Cuisine Preferences (Multi-select)
 * - Spice Level (1-5 slider)
 */

import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, ChefHat, Flame, Leaf, WheatOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const DIETARY_TYPES = [
    { id: 'none', label: 'None', icon: null },
    { id: 'vegetarian', label: 'Vegetarian', icon: <Leaf size={16} /> },
    { id: 'vegan', label: 'Vegan', icon: <Leaf size={16} className="text-green-500" /> },
    { id: 'keto', label: 'Keto', icon: <Flame size={16} className="text-orange-500" /> },
    { id: 'paleo', label: 'Paleo', icon: <ChefHat size={16} /> },
    { id: 'gluten-free', label: 'Gluten Free', icon: <WheatOff size={16} /> }
];

const COMMON_ALLERGENS = [
    'Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish'
];

const CUISINES = [
    'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'Mediterranean', 'American'
];

const PreferencesModal = ({ isOpen, onClose }) => {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        dietary_type: 'none',
        allergies: [],
        cuisine_preferences: [],
        spice_level: 2
    });

    // Load user preferences when modal opens
    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                dietary_type: user.dietary_type || 'none',
                allergies: user.allergies || [],
                cuisine_preferences: user.cuisine_preferences || [],
                spice_level: user.spice_level || 2
            });
        }
    }, [isOpen, user]);

    // Handle Closing
    const handleClose = () => {
        // Reset form to current user state if closed without saving
        if (user) {
            setFormData({
                dietary_type: user.dietary_type || 'none',
                allergies: user.allergies || [],
                cuisine_preferences: user.cuisine_preferences || [],
                spice_level: user.spice_level || 2
            });
        }
        onClose();
    };

    // Handle Save
    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://127.0.0.1:5000/api/auth/preferences',
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Update local auth context
            updateProfile(response.data.user);

            toast.success('Preferences updated successfully');
            onClose();
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error.response?.data?.error || 'Failed to update preferences');
        } finally {
            setLoading(false);
        }
    };

    // Toggle Selection Helper
    const toggleSelection = (list, item) => {
        if (list.includes(item)) {
            return list.filter(i => i !== item);
        } else {
            return [...list, item];
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dietary Preferences</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Customize how AI generates your recipes
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-8">

                            {/* 1. Dietary Type */}
                            <section>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Dietary Requirement
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {DIETARY_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setFormData({ ...formData, dietary_type: type.id })}
                                            className={`
                                                flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all
                                                ${formData.dietary_type === type.id
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-transparent bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }
                                            `}
                                        >
                                            {type.icon}
                                            <span>{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* 2. Allergies */}
                            <section>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Allergies / Avoid
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {COMMON_ALLERGENS.map((allergen) => (
                                        <button
                                            key={allergen}
                                            onClick={() => setFormData({
                                                ...formData,
                                                allergies: toggleSelection(formData.allergies, allergen)
                                            })}
                                            className={`
                                                px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                                                ${formData.allergies.includes(allergen)
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 ring-2 ring-red-500 ring-offset-2 dark:ring-offset-gray-800'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }
                                            `}
                                        >
                                            {allergen}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* 3. Spice Level */}
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Spice Tolerance
                                    </label>
                                    <span className="text-sm font-bold text-primary">
                                        {['Mild', 'Medium', 'Hot', 'Extra Hot', 'Extreme'][formData.spice_level - 1]}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    step="1"
                                    value={formData.spice_level}
                                    onChange={(e) => setFormData({ ...formData, spice_level: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>Mild</span>
                                    <span>Extreme</span>
                                </div>
                            </section>

                            {/* 4. Cuisine Preferences (Optional) */}
                            <section>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Favorite Cuisines
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CUISINES.map((cuisine) => (
                                        <button
                                            key={cuisine}
                                            onClick={() => setFormData({
                                                ...formData,
                                                cuisine_preferences: toggleSelection(formData.cuisine_preferences, cuisine)
                                            })}
                                            className={`
                                                px-3 py-1.5 rounded-lg text-sm border transition-all
                                                ${formData.cuisine_preferences.includes(cuisine)
                                                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                                                }
                                            `}
                                        >
                                            {cuisine}
                                        </button>
                                    ))}
                                </div>
                            </section>

                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 rounded-b-2xl">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white mr-3 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className={`
                                    flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg font-medium shadow-lg shadow-primary/30
                                    transition-all hover:bg-primary-dark active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed
                                `}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Check size={18} />
                                        <span>Save Preferences</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PreferencesModal;
