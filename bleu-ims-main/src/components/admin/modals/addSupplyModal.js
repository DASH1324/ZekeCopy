import React, { useState } from "react";
import "./addSupplyModal.css";

const getAuthToken = () => localStorage.getItem("access_token");

function AddSupplyModal({ onClose, onSubmit }) {
    const [supplyName, setSupplyName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [measurement, setMeasurement] = useState("");
    const [supplyDate, setSupplyDate] = useState("");

    const [errors, setErrors] = useState({
        supplyName: "",
        quantity: "",
        measurement: "",
        supplyDate: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!supplyName) newErrors.supplyName = "This field is required";
        if (!quantity) newErrors.quantity = "This field is required";
        if (!measurement) newErrors.measurement = "This field is required";
        if (!supplyDate) newErrors.supplyDate = "This field is required";

        setErrors(newErrors);

         if (Object.keys(newErrors).length === 0) {
            const token = getAuthToken();
            if (!token) {
                alert("Authentication token not found.");
                return;
            }

            const newSupply = {
                MaterialName: supplyName,
                MaterialQuantity: parseFloat(quantity),
                MaterialMeasurement: measurement,
                DateAdded: supplyDate
            };

            try {
                const response = await fetch("http://127.0.0.1:8003/materials/materials/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(newSupply)
                });

                if (!response.ok) {
                    throw new Error("Failed to add item.");
                }

                const result = await response.json();
                if (onSubmit) onSubmit(result);
                onClose();

            } catch (error) {
                console.error("Error adding item:", error);
                alert("Failed to add item.");
            }
        }
    };

    const handleFocus = (field) => {
        setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: ""
        }));
    };

    return (
        <div className="addSupply-modal-overlay">
            <div className="addSupply-modal-container">
                <div className="addSupply-modal-header">
                    <h3>Add Supply</h3>
                    <span className="addSupply-close-button" onClick={onClose}>&times;</span>
                </div>
                <form className="addSupply-modal-form" onSubmit={handleSubmit}>
                    <label>
                        Supply or Material Name <span className="addSupply-required-asterisk">*</span>
                        <input
                            type="text"
                            value={supplyName}
                            onChange={(e) => setSupplyName(e.target.value)}
                            onFocus={() => handleFocus('supplyName')}
                            className={errors.supplyName ? "addSupply-error" : ""}
                        />
                        {errors.supplyName && <p className="addSupply-error-message">{errors.supplyName}</p>}
                    </label>

                    <div className="addSupply-row">
                        <label className="addSupply-half">
                            Quantity <span className="addSupply-required-asterisk">*</span>
                            <input
                                type="text"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                onFocus={() => handleFocus('quantity')}
                                className={errors.quantity ? "addSupply-error" : ""}
                            />
                            {errors.quantity && <p className="addSupply-error-message">{errors.quantity}</p>}
                        </label>

                        <label className="addSupply-half">
                            Measurement <span className="addSupply-required-asterisk">*</span>
                            <select
                                value={measurement}
                                onChange={(e) => setMeasurement(e.target.value)}
                                onFocus={() => handleFocus('measurement')}
                                className={errors.measurement ? "addSupply-error" : ""}
                                required
                            >
                                <option value="">Select unit</option>
                                <option value="pcs">pcs</option>
                                <option value="box">box</option>
                                <option value="pack">pack</option>
                            </select>
                            {errors.measurement && <p className="addSupply-error-message">{errors.measurement}</p>}
                        </label>
                    </div>

                    <label>
                        Supply Date <span className="addSupply-required-asterisk">*</span>
                        <input
                            type="date"
                            value={supplyDate}
                            onChange={(e) => setSupplyDate(e.target.value)}
                            onFocus={() => handleFocus('supplyDate')}
                            className={errors.supplyDate ? "addSupply-error" : ""}
                        />
                        {errors.supplyDate && <p className="addSupply-error-message">{errors.supplyDate}</p>}
                    </label>

                    <div className="addSupply-button-container">
                        <button className="addSupply-submit-button">Add Supply</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddSupplyModal;