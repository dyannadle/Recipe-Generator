import React, { useState } from 'react';
import { motion } from 'framer-motion';

const RecipeCard = ({ title, ingredients = [], recipe = [], imagePreview }) => {
    const [activeTab, setActiveTab] = useState(0);

    // Ensure we have arrays
    const titles = Array.isArray(title) ? title : [title];
    const ingredientLists = Array.isArray(ingredients[0]) ? ingredients : [ingredients];
    const recipeLists = Array.isArray(recipe[0]) ? recipe : [recipe];

    const currentTitle = titles[activeTab] || titles[0];
    const currentIngredients = ingredientLists[activeTab] || ingredientLists[0];
    const currentRecipe = recipeLists[activeTab] || recipeLists[0];

    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                {/* Tabs for Variations */}
                {titles.length > 1 && (
                    <div className="flex border-b border-gray-200 bg-gray-50/50">
                        {titles.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(idx)}
                                className={`flex-1 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${activeTab === idx
                                        ? 'border-primary text-primary bg-white shadow-xs'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Variation {idx + 1}
                            </button>
                        ))}
                    </div>
                )}

                <div className="md:flex">
                    <div className="md:w-1/2 relative h-64 md:h-auto">
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Food"
                                className="w-full h-full object-cover"
                            />
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent md:bg-linear-to-r md:from-transparent md:to-transparent flex items-end p-6">
                            <h2 className="text-white text-2xl font-bold md:hidden">{currentTitle}</h2>
                        </div>
                    </div>

                    <div className="p-8 md:w-1/2">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 hidden md:block">{currentTitle}</h2>

                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
                                <span className="bg-primary/10 p-2 rounded-lg mr-2">🥕</span>
                                Ingredients
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {currentIngredients && currentIngredients.map((ing, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/10 text-teal-700"
                                    >
                                        {ing}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
                                <span className="bg-primary/10 p-2 rounded-lg mr-2">📝</span>
                                Instructions
                            </h3>
                            <ul className="space-y-3">
                                {currentRecipe && currentRecipe.map((step, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <span className="text-gray-600 text-sm leading-relaxed">{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RecipeCard;
