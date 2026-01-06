import React, { useState, useRef } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ImageUpload from './components/ImageUpload';
import RecipeCard from './components/RecipeCard';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);

  const uploadSectionRef = useRef(null);

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

      // Handle backend response format
      // Expecting { title: [], ingredients: [], recipe: [] } or similar
      const data = response.data;

      // The backend returns lists for multiple generations, we'll take the first one or valid one
      // If data.title is an array
      let title = Array.isArray(data.title) ? data.title[0] : data.title;
      let ingredients = Array.isArray(data.ingredients) ? data.ingredients[0] : data.ingredients;
      let recipe = Array.isArray(data.recipe) ? data.recipe[0] : data.recipe;

      if (title === "Not a valid recipe!") {
        setError("Could not identify a valid recipe from this image. Please try another one.");
      } else if (title === "Not a valid food image!") {
        setError("Our AI detected that this image is likely not food. Please upload a clear photo of food.");
      } else {
        setResult({
          title,
          ingredients,
          recipe
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
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

      <footer className="bg-white border-t border-gray-100 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} SnapCook AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
