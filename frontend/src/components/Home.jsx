import React, { useState, useRef } from 'react';
import axios from 'axios';
import Hero from './Hero';
import ImageUpload from './ImageUpload';
import RecipeCard from './RecipeCard';

const Home = ({ scrollToUpload, uploadSectionRef }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState(null);

    const handleUpload = async (file) => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        // Create image preview
        const objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);

        const formData = new FormData();
        formData.append('imagefile', file);

        try {
            const response = await axios.post('http://127.0.0.1:5000/predict', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = response.data;

            // The backend returns lists for multiple generations
            if (Array.isArray(data.title) && data.title[0] === "Not a valid recipe!") {
                setError("Could not identify a valid recipe from this image. Please try another one.");
            } else if (Array.isArray(data.title) && data.title[0] === "Not a valid food image!") {
                setError("Our AI detected that this image is likely not food. Please upload a clear photo of food.");
            } else {
                setResult({
                    title: data.title,
                    ingredients: data.ingredients,
                    recipe: data.recipe
                });
            }

        } catch (err) {
            console.error(err);
            setError("Failed to connect to the server. Please ensure the backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Hero scrollToUpload={scrollToUpload} />

            <div ref={uploadSectionRef} className="pt-10">
                <ImageUpload onUpload={handleUpload} isLoading={isLoading} />
            </div>

            {error && (
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {result && (
                <RecipeCard
                    title={result.title}
                    ingredients={result.ingredients}
                    recipe={result.recipe}
                    imagePreview={imagePreview}
                />
            )}
        </>
    );
};

export default Home;
