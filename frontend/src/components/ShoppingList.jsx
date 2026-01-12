import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, Check, Copy, ShoppingBag, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ShoppingList = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchItems = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:5000/api/shopping-list');
            setItems(res.data.items);
        } catch (error) {
            console.error('Error fetching shopping list:', error);
            toast.error('Failed to load shopping list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const addItem = async (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        try {
            const res = await axios.post('http://127.0.0.1:5000/api/shopping-list', { item: newItem });
            setItems([res.data.item, ...items]);
            setNewItem('');
            toast.success('Item added');
        } catch (error) {
            toast.error('Failed to add item');
        }
    };

    const toggleItem = async (id) => {
        // Optimistic update
        const updatedItems = items.map(item =>
            item.id === id ? { ...item, is_checked: !item.is_checked } : item
        );
        setItems(updatedItems);

        try {
            await axios.put(`http://127.0.0.1:5000/api/shopping-list/${id}/toggle`);
        } catch (error) {
            toast.error('Failed to update item');
            fetchItems(); // Revert on failure
        }
    };

    const deleteItem = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/api/shopping-list/${id}`);
            setItems(items.filter(item => item.id !== id));
            toast.success('Item removed');
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const clearChecked = async () => {
        try {
            await axios.delete('http://127.0.0.1:5000/api/shopping-list/clear?type=checked');
            setItems(items.filter(item => !item.is_checked));
            toast.success('Checked items cleared');
        } catch (error) {
            toast.error('Failed to clear items');
        }
    };

    const copyToClipboard = () => {
        const text = items.map(item => `${item.is_checked ? '[x]' : '[ ]'} ${item.item}`).join('\n');
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pt-24 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">

                    {/* Header */}
                    <div className="p-6 bg-primary text-white flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <ShoppingBag size={24} />
                            <h1 className="text-2xl font-bold">Shopping List</h1>
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                            title="Copy list"
                        >
                            <Copy size={20} />
                        </button>
                    </div>

                    {/* Add Item Form */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <form onSubmit={addItem} className="flex gap-2">
                            <input
                                type="text"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="Add an item..."
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                            <button
                                type="submit"
                                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                            >
                                <Plus size={20} />
                            </button>
                        </form>
                    </div>

                    {/* List */}
                    <div className="p-2">
                        {items.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                <ShoppingBag size={48} className="mx-auto mb-3 opacity-20" />
                                <p>Your shopping list is empty</p>
                            </div>
                        ) : (
                            <ul className="space-y-1">
                                <AnimatePresence>
                                    {items.map(item => (
                                        <motion.li
                                            key={item.id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={`group flex items-center justify-between p-3 rounded-lg transition-colors ${item.is_checked ? 'bg-gray-50 dark:bg-gray-800/50' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3 flex-1 cursor-pointer" onClick={() => toggleItem(item.id)}>
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.is_checked
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'border-gray-300 dark:border-gray-500'
                                                    }`}>
                                                    {item.is_checked && <Check size={14} strokeWidth={3} />}
                                                </div>
                                                <span className={`text-gray-700 dark:text-gray-200 transition-all ${item.is_checked ? 'line-through text-gray-400 dark:text-gray-500' : ''
                                                    }`}>
                                                    {item.item}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => deleteItem(item.id)}
                                                className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </ul>
                        )}
                    </div>

                    {/* Footer Actions */}
                    {items.some(i => i.is_checked) && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <button
                                onClick={clearChecked}
                                className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center space-x-1"
                            >
                                <Trash2 size={16} />
                                <span>Clear Checked Items</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShoppingList;
