import React from 'react';
import { motion } from 'framer-motion';
import kitchenImg from '../assets/about-kitchen.png';
import aiImg from '../assets/about-ai.png';

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-primary to-orange-500">
                        Revolutionizing Cooking with AI
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        SnapCook combines advanced computer vision with culinary expertise to turn your ingredients into delicious recipes instantly.
                    </p>
                </motion.div>

                {/* Mission Section */}
                <div className="flex flex-col md:flex-row items-center gap-10 mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="md:w-1/2"
                    >
                        <img src={kitchenImg} alt="Modern Kitchen" className="rounded-2xl shadow-2xl w-full object-cover h-64 md:h-96" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="md:w-1/2"
                    >
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Mission</h2>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            We believe that cooking should be accessible, fun, and creative for everyone.
                            Often, we stare at a fridge full of ingredients without knowing what to make.
                            <b>SnapCook</b> eliminates that friction. By simply snapping a photo, our AI identifies your ingredients
                            and suggests recipes that reduce food waste and spark culinary joy.
                        </p>
                    </motion.div>
                </div>

                {/* How it Works Section */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-10">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="md:w-1/2"
                    >
                        <img src={aiImg} alt="AI Food Analysis" className="rounded-2xl shadow-2xl w-full object-cover h-64 md:h-96" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="md:w-1/2"
                    >
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">How It Works</h2>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold mr-3">1</span>
                                <p className="text-gray-600 text-lg"><b>Upload:</b> Take a photo of your food or ingredients.</p>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold mr-3">2</span>
                                <p className="text-gray-600 text-lg"><b>Analyze:</b> Our Neural Networks (ResNet50 & Transformers) define the ingredients and verify they are food.</p>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold mr-3">3</span>
                                <p className="text-gray-600 text-lg"><b>Cook:</b> Get a complete, step-by-step recipe tailored to what you have.</p>
                            </li>
                        </ul>
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

export default About;
