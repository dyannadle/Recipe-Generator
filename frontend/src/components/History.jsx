import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ChefHat } from 'lucide-react';

const History = ({ history, onSelectRecipe }) => {
    if (!history || history.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
            <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-gray-400 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Recent Recipes</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {history.map((item, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectRecipe(item)}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all"
                    >
                        <div className="flex items-start space-x-4">
                            {item.imagePreview ? (
                                <img
                                    src={item.imagePreview}
                                    alt={item.title}
                                    className="w-16 h-16 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <ChefHat className="w-8 h-8 text-gray-400" />
                                </div>
                            )}
                            <div>
                                <h3 className="font-medium text-gray-900 line-clamp-1">{item.title}</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </p>
                                <div className="flex items-center mt-2">
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        View Recipe
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default History;
