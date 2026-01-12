import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Hero from './Hero';
import ImageUpload from './ImageUpload';
import RecipeCard from './RecipeCard';
import History from './History';

const Home = ({ scrollToUpload, uploadSectionRef }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [history, setHistory] = useState([]);

    // Load history from localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('recipeHistory');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    const saveToHistory = (data, image) => {
        const newEntry = {
            ...data,
            imagePreview: image,
            timestamp: new Date().toISOString()
        };

        const updatedHistory = [newEntry, ...history].slice(0, 6); // Keep last 6
        setHistory(updatedHistory);
        localStorage.setItem('recipeHistory', JSON.stringify(updatedHistory));
    };

    const handleUpload = async (file, metaData = {}) => {
        setIsLoading(true);
        setResult(null);

        // Create image preview
        const objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);

        const formData = new FormData();
        formData.append('imagefile', file);
        if (metaData.title) formData.append('title', metaData.title);
        if (metaData.ingredients) formData.append('ingredients', metaData.ingredients);

        try {
            const response = await axios.post('http://127.0.0.1:5000/predict', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = response.data;

            // The backend returns lists for multiple generations
            if (Array.isArray(data.title) && data.title[0] === "Not a valid recipe!") {
                toast.error("Could not identify a valid recipe from this image.");
            } else if (Array.isArray(data.title) && data.title[0] === "Not a valid food image!") {
                toast.error("This doesn't look like food! Please try a clear food photo.");
            } else {
                const resultData = {
                    title: data.title,
                    ingredients: data.ingredients,
                    recipe: data.recipe,
                    imageUrl: data.image_url // Store the persistent URL
                };
                setResult(resultData);
                // Use the persistent URL from backend for history, not the temporary blob
                saveToHistory(resultData, data.image_url || objectUrl);
                toast.success("Recipe generated successfully!");
            }

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to connect to the server.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectHistory = (item) => {
        setResult(item);
        setImagePreview(item.imagePreview);
        window.scrollTo({ top: uploadSectionRef.current.offsetTop, behavior: 'smooth' });
    };

    return (
        <>
            <div className="print:hidden">
                <Hero scrollToUpload={scrollToUpload} />
            </div>

            <div ref={uploadSectionRef} className="pt-10 print:hidden">
                <ImageUpload onUpload={handleUpload} isLoading={isLoading} />
            </div>

            {result ? (
                <RecipeCard
                    title={result.title}
                    ingredients={result.ingredients}
                    recipe={result.recipe}
                    imagePreview={imagePreview}
                    onBack={() => setResult(null)}
                />
            ) : (
                <History history={history} onSelectRecipe={handleSelectHistory} />
            )}
        </>
    );
};

export default Home;
