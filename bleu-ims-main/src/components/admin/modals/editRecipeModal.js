import React, { useState, useEffect } from "react";
import "./editRecipeModal.css";

const API_BASE_URL = "http://127.0.0.1:8002";
const getAuthToken = () => localStorage.getItem("access_token");

function EditRecipeModal({ recipe, onClose, onUpdate, type }) {
    const [editedRecipe, setEditedRecipe] = useState({ ...recipe });
    const [errors, setErrors] = useState({
        name: "",
        description: "",
        category: "",
        ingredients: "",
        instructions: ""
    });

    // Categories based on type
    const drinkCategories = [
        "Barista Choice",
        "Specialty Coffee",
        "Premium Coffee",
        "Non-Coffee",
        "Frappe", 
        "Sparkling Series",
        "Milktea"
    ];

    const foodCategories = [
        "Rice Meals",
        "Pasta",
        "Snacks",
        "Sandwiches",
        
    ];

    const categories = type === "drink" ? drinkCategories : foodCategories;

    useEffect(() => {
        setEditedRecipe({ ...recipe });
    }, [recipe]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedRecipe((prev) => ({ ...prev, [name]: value }));
    };

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...(editedRecipe.ingredients || [])];
        newIngredients[index][field] = value;
        setEditedRecipe((prev) => ({ ...prev, ingredients: newIngredients }));
    };

    const handleAddIngredient = () => {
        setEditedRecipe((prev) => ({
            ...prev,
            ingredients: [...(prev.ingredients || []), { name: "", amount: "", measurement: "" }]
        }));
    };

    const handleRemoveIngredient = (index) => {
        setEditedRecipe((prev) => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!editedRecipe.name) newErrors.name = "Recipe name is required";
        if (!editedRecipe.description) newErrors.description = "Description is required";
        if (!editedRecipe.category) newErrors.category = "Category is required";
        if (!editedRecipe.ingredients || editedRecipe.ingredients.length === 0) newErrors.ingredients = "At least one ingredient is required";
       
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            const token = getAuthToken();
            if (!token) {
                alert("Authentication token not found.");
                return;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/recipes/recipes/${editedRecipe.id}/`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ ...editedRecipe, type })
                });
                if (!response.ok) throw new Error("Failed to update recipe.");
                const result = await response.json();
                if (onUpdate) onUpdate(result);
                onClose();
            } catch (error) {
                console.error("Error updating recipe:", error);
                alert("Failed to update recipe.");
            }
        }
    };

    return (
        <div className="editRecipe-modal-overlay">
            <div className="editRecipe-modal-container">
                <div className="editRecipe-modal-header">
                    <h3>Edit {type === "drink" ? "Drink" : "Food"} Recipe</h3>
                    <span className="editRecipe-close-button" onClick={onClose}>&times;</span>
                </div>
                <form className="editRecipe-modal-form" onSubmit={handleSubmit}>
                    <label>
                        Recipe Name <span className="required">*</span>
                        <input
                            type="text"
                            name="name"
                            value={editedRecipe.name || ""}
                            onChange={handleChange}
                            className={errors.name ? "error" : ""}
                        />
                        {errors.name && <p className="error-message">{errors.name}</p>}
                    </label>
                    <label>
                        Description <span className="required">*</span>
                        <textarea
                            name="description"
                            value={editedRecipe.description || ""}
                            onChange={handleChange}
                            className={errors.description ? "error" : ""}
                        />
                        {errors.description && <p className="error-message">{errors.description}</p>}
                    </label>
                    <label>
                        Category <span className="required">*</span>
                        <select
                            name="category"
                            value={editedRecipe.category || ""}
                            onChange={handleChange}
                            className={errors.category ? "error" : ""}
                            style={{ 
                                appearance: 'menulist',
                                WebkitAppearance: 'menulist',
                                MozAppearance: 'menulist'
                            }}
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {errors.category && <p className="error-message">{errors.category}</p>}
                    </label>
                    <div className="ingredients-section">
                        <h4>Ingredients <span className="required">*</span></h4>
                        {(editedRecipe.ingredients || []).map((ingredient, index) => (
                            <div key={index} className="ingredient-row">
                                <input
                                    type="text"
                                    placeholder="Ingredient name"
                                    value={ingredient.name}
                                    onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    value={ingredient.amount}
                                    onChange={(e) => handleIngredientChange(index, "amount", e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Unit"
                                    value={ingredient.unit}
                                    onChange={(e) => handleIngredientChange(index, "units", e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveIngredient(index)}
                                    className="remove-ingredient-button"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddIngredient}
                            className="add-ingredient-button"
                        >
                            + Add Ingredient
                        </button>
                        {errors.ingredients && <p className="error-message">{errors.ingredients}</p>}
                    </div>
                    <label>
                    </label>
                      
                    <div className="editRecipe-button-container">
                        <button type="submit" className="editRecipe-submit-button">
                            Update Recipe
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditRecipeModal;