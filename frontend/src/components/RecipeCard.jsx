import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, ArrowLeft, Share2, Copy, Check } from 'lucide-react';

const RecipeCard = ({ title, ingredients = [], recipe = [], imagePreview, onBack }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    // Ensure we have arrays
    const titles = Array.isArray(title) ? title : [title];
    const ingredientLists = Array.isArray(ingredients[0]) ? ingredients : [ingredients];
    const recipeLists = Array.isArray(recipe[0]) ? recipe : [recipe];

    const currentTitle = titles[activeTab] || titles[0];
    const currentIngredients = ingredientLists[activeTab] || ingredientLists[0];
    const currentRecipe = recipeLists[activeTab] || recipeLists[0];

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async (platform) => {
        const shareText = `Check out this recipe: ${currentTitle}`;
        const shareUrl = window.location.href;

        switch (platform) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
                break;
            case 'copy':
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
                break;
            default:
                // Web Share API for mobile
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: currentTitle,
                            text: shareText,
                            url: shareUrl
                        });
                    } catch (err) {
                        console.error('Share failed:', err);
                    }
                }
        }
        setShowShareMenu(false);
    };

    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 print:p-0 print:max-w-none"
        >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 print:shadow-none print:border-none">

                {/* Tabs for Variations */}
                {titles.length > 1 && (
                    <div className="flex border-b border-gray-200 bg-gray-50/50 print:hidden">
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

                <div className="md:flex print:block">
                    <div className="md:w-1/2 relative h-64 md:h-auto print:w-full print:h-80 print:mb-6">
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Food"
                                className="w-full h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none print:rounded-2xl"
                            />
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent md:bg-linear-to-r md:from-transparent md:to-transparent flex items-end p-6 print:hidden">
                            <h2 className="text-white text-2xl font-bold md:hidden">{currentTitle}</h2>
                        </div>
                    </div>

                    <div className="p-8 md:w-1/2 print:w-full print:p-0">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-3xl font-bold text-gray-900 hidden md:block print:block">{currentTitle}</h2>
                            <div className="flex space-x-2 print:hidden">
                                {onBack && (
                                    <button
                                        onClick={onBack}
                                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                                        title="Back to Upload"
                                    >
                                        <ArrowLeft size={24} />
                                    </button>
                                )}
                                <button
                                    onClick={handlePrint}
                                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                                    title="Print Recipe"
                                >
                                    <Printer size={24} />
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowShareMenu(!showShareMenu)}
                                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                                        title="Share Recipe"
                                    >
                                        <Share2 size={24} />
                                    </button>
                                    {showShareMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                                            <button
                                                onClick={() => handleShare('whatsapp')}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                                            >
                                                <span>📱</span>
                                                <span>Share on WhatsApp</span>
                                            </button>
                                            <button
                                                onClick={() => handleShare('twitter')}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                                            >
                                                <span>🐦</span>
                                                <span>Share on Twitter</span>
                                            </button>
                                            <button
                                                onClick={() => handleShare('copy')}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                                            >
                                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
                                <span className="bg-primary/10 p-2 rounded-lg mr-2 print:border print:border-gray-200">🥕</span>
                                Ingredients
                            </h3>
                            <div className="flex flex-wrap gap-2 print:block">
                                {currentIngredients && currentIngredients.map((ing, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/10 text-teal-700 print:bg-transparent print:text-black print:px-0 print:mr-4 print:inline-block"
                                    >
                                        • {ing}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
                                <span className="bg-primary/10 p-2 rounded-lg mr-2 print:border print:border-gray-200">📝</span>
                                Instructions
                            </h3>
                            <ul className="space-y-3">
                                {currentRecipe && currentRecipe.map((step, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 print:border print:border-gray-200">
                                            {idx + 1}
                                        </span>
                                        <span className="text-gray-600 text-sm leading-relaxed print:text-black">{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print-only footer */}
            <div className="hidden print:block text-center mt-8 text-sm text-gray-500">
                Generated by SnapCook AI
            </div>
        </motion.div>
    );
};

export default RecipeCard;
