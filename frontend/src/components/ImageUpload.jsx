import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

const ImageUpload = ({ onUpload, isLoading }) => {
    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState('');

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length > 0) {
            onUpload(acceptedFiles[0], { title, ingredients });
        }
    }, [onUpload, title, ingredients]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        multiple: false,
        disabled: isLoading
    });

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
            id="upload-section"
        >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recipe Name (Optional)
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Grandma's Apple Pie"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-400 mt-1">If set, this will override the AI-detected name.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hidden Ingredients (Optional)
                        </label>
                        <input
                            type="text"
                            value={ingredients}
                            onChange={(e) => setIngredients(e.target.value)}
                            placeholder="e.g. salt, love, secret sauce"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-400 mt-1">These will be added to the ingredients list.</p>
                    </div>
                </div>
            </div>

            <div
                {...getRootProps()}
                className={`relative border - 2 border - dashed rounded - xl p - 12 text - center cursor - pointer transition - all duration - 300 ease -in -out
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
`}
            >
                <input {...getInputProps()} />

                <div className="space-y-4">
                    <div className="mx-auto h-20 w-20 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                    </div>

                    <div className="text-gray-600">
                        {isDragActive ? (
                            <p className="text-lg font-medium text-primary">Drop the image here...</p>
                        ) : (
                            <>
                                <p className="text-lg font-medium">Drag & drop a food image here</p>
                                <p className="text-sm text-gray-500 mt-2">or</p>
                                <div className="flex flex-col sm:flex-row gap-3 mt-4 justify-center">
                                    <label className="cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => e.target.files[0] && onDrop([e.target.files[0]])}
                                            className="hidden"
                                            disabled={isLoading}
                                        />
                                        <span className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-500 transition-colors">
                                            📁 Choose File
                                        </span>
                                    </label>
                                    <label className="cursor-pointer sm:hidden">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={(e) => e.target.files[0] && onDrop([e.target.files[0]])}
                                            className="hidden"
                                            disabled={isLoading}
                                        />
                                        <span className="inline-flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-teal-500 transition-colors">
                                            📷 Take Photo
                                        </span>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-400 mt-3">Supports JPG, JPEG, PNG</p>
                            </>
                        )}
                    </div>
                </div>

                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                            <p className="mt-3 text-primary font-medium">Analyzing ingredients...</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ImageUpload;
