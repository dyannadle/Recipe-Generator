import React from 'react';

const NutritionLabel = ({ nutrition }) => {
    if (!nutrition) return null;

    const { calories, protein, carbs, fat } = nutrition;

    return (
        <div className="bg-white border-2 border-black p-4 font-sans text-black max-w-xs mx-auto shadow-sm">
            <h2 className="text-3xl font-extrabold border-b-8 border-black pb-1 mb-1">Nutrition Facts</h2>
            <div className="text-sm font-bold border-b border-black pb-1 mb-1">
                Amount Per Serving
            </div>
            <div className="flex justify-between items-end border-b-4 border-black pb-1 mb-2">
                <span className="font-extrabold text-2xl">Calories</span>
                <span className="font-extrabold text-2xl">{calories}</span>
            </div>

            <div className="text-sm">
                <div className="flex justify-between border-b border-gray-300 py-1">
                    <span className="font-bold">Total Fat</span>
                    <span>{fat}g</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-1">
                    <span className="font-bold">Total Carbohydrate</span>
                    <span>{carbs}g</span>
                </div>
                <div className="flex justify-between border-b-4 border-black py-1">
                    <span className="font-bold">Protein</span>
                    <span>{protein}g</span>
                </div>
            </div>
            <div className="text-xs mt-2 text-gray-600">
                *Estimated values based on ingredients.
            </div>
        </div>
    );
};

export default NutritionLabel;
