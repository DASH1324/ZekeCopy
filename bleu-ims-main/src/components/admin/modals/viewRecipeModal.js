import React from 'react';
import './viewRecipeModal.css';

function ViewRecipeModal({ recipe, onClose, onEdit, type }) {
    // Add a console.log here to see the exact structure of the recipe object
    console.log("Recipe data passed to View Modal:", recipe);

    return (
        <div className="viewRecipe-modal-overlay">
            <div className="viewRecipe-modal-container">
                <div className="viewRecipe-modal-header">
                    {/* The `type` prop is not passed from recipeManagement, so let's make this more generic */}
                    <h3>Recipe Details</h3>
                    <span className="viewRecipe-close-button" onClick={onClose}>×</span>
                </div>
                <div className="viewRecipe-modal-content">
                    <div className="recipe-detail">
                        <h4>Recipe Name</h4>
                        {/* `recipe.RecipeName` is more reliable as `name` is not on the object */}
                        <p>{recipe.RecipeName}</p>
                    </div>

                    <div className="recipe-detail">
                        <h4>Description</h4>
                        {/* The description is not on the recipe object, but was added in handleView */}
                        <p>{recipe.description || 'No description available.'}</p>
                    </div>

                    <div className="recipe-detail">
                        <h4>Category</h4>
                         {/* The category is not on the recipe object, but was added in handleView */}
                        <p>{recipe.category || 'No category available.'}</p>
                    </div>

                    <div className="recipe-detail">
                        <h4>Ingredients</h4>
                        <div className="ingredients-list">
                            {/* --- FIX IS HERE: Use the correct property names from the API --- */}
                            {recipe.Ingredients && recipe.Ingredients.map((ingredient, index) => (
                                <div key={index} className="ingredient-item">
                                    <span>{ingredient.IngredientName}</span>
                                    <span>{ingredient.Amount} {ingredient.Unit}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="viewRecipe-button-container">
                        <button
                            className="viewRecipe-edit-button"
                            onClick={() => onEdit(recipe)}
                        >
                            Edit Recipe
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewRecipeModal;