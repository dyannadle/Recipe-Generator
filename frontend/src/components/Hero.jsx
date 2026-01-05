import React from 'react';
import { motion } from 'framer-motion';

const Hero = ({ scrollToUpload }) => {
    return (
        <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
                >
                    <span className="block">Turn your food photos</span>
                    <span className="block text-primary">into delicious recipes</span>
                </motion.h1>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
                >
                    Advanced AI analysis identifies ingredients from your image and suggests the perfect recipe. Cooking has never been easier.
                </motion.p>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8"
                >
                    <div className="rounded-md shadow-md">
                        <button
                            onClick={scrollToUpload}
                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-red-500 md:py-4 md:text-lg md:px-10 transition-all transform hover:scale-105"
                        >
                            Get Started
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Background blobs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl z-0 pointer-events-none opacity-30">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>
        </div>
    );
};

export default Hero;
