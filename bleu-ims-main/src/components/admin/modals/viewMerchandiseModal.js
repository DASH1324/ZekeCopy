import React from "react";
import "./viewMerchandiseModal.css";
import { FaTimes, FaEdit, FaArchive } from "react-icons/fa";

const ViewMerchandiseModal = ({ merchandise, onClose, onEdit, onDelete }) => {
    if (!merchandise) return null;

    return (
        <div className="view-merchandise-modal-overlay">
            <div className="view-merchandise-modal">
                <button className="view-merchandise-close-button" onClick={onClose}><FaTimes /></button>

                <h2 className="view-merchandise-name">{merchandise.name}</h2>
                <hr className="view-merchandise-divider" />

                <div className="view-merchandise-modal-content">
                    <div className="view-merchandise-label">Quantity</div>
                    <div className="view-merchandise-value">{merchandise.quantity}</div>

                    <div className="view-merchandise-label">Date Added</div>
                    <div className="view-merchandise-value">{merchandise.dateAdded}</div>

                    <div className="view-merchandise-label">Status</div>
                    <div className="view-merchandise-value">{merchandise.status}</div>
                </div>

                <div className="view-merchandise-modal-actions">
                    <button className="view-merchandise-edit-button" onClick={() => onEdit(merchandise)}><FaEdit /> Edit</button>
                    <button className="view-merchandise-delete-button" onClick={() => onDelete(merchandise.id)}><FaArchive /> Delete</button>
                </div>
            </div>
        </div>
    );
};

export default ViewMerchandiseModal;
