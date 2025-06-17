import React from "react";
import "./viewIngredientModal.css";
import { FaTimes, FaEdit, FaArchive } from "react-icons/fa";

const ViewIngredientModal = ({ ingredient, onClose, onEdit, onDelete }) => {
    if (!ingredient) return null;

    return (
        <div className="view-ingredient-modal-overlay">
            <div className="view-ingredient-modal">
                <button className="view-ingredient-close-button" onClick={onClose}><FaTimes /></button>

                <h2 className="view-ingredient-product-name">{ingredient.name}</h2>
                <hr className="view-ingredient-divider" />

                <div className="view-ingredient-modal-content">
                    <div className="view-ingredient-amount-label">Amount</div>
                    <div className="view-ingredient-amount">{ingredient.amount} {ingredient.measurement}</div>
                    <div className="view-ingredient-bestBefore-label">Best Before</div>
                    <div className="view-ingredient-bestBefore">{ingredient.bestBefore}</div>
                    <div className="view-ingredient-expiration-label">Expiration</div>
                    <div className="view-ingredient-expiration">{ingredient.expiration}</div>
                    <div className="view-ingredient-status-label">Status</div>
                    <div className="view-ingredient-status">{ingredient.status}</div>
                </div>

                <div className="view-ingredient-modal-actions">
                    <button className="view-ingredient-modal-edit-button" onClick={() => onEdit(ingredient)}><FaEdit /> Edit</button>
                    <button className="view-ingredient-modal-delete-button" onClick={() => onDelete(ingredient.id)}><FaArchive /> Delete</button>
                </div>
            </div>
        </div>
    );
};

export default ViewIngredientModal;
