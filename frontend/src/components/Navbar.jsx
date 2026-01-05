import React from 'react';
import { motion } from 'framer-motion';

const Navbar = () => {
    return (
        <motion.nav
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-orange-500">
                            SnapCook
                        </span>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <a href="#" className="hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</a>
                            <a href="#" className="hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">About</a>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-500 transition-colors shadow-lg hover:shadow-xl">
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
