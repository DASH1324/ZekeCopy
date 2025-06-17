import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./LogINAs.css"; 
import logo from "../assets/bleu_logo1.jpg"; 

const LogINAs = () => {
  const navigate = useNavigate(); 

  const handleLogin = () => {
     navigate("/login"); 
  };
   

  return (
    <div className="button-container">
      <img src={logo} alt="Blue Coffee Shop Logo" className="logo" />
      <h2>Welcome to Bleu Bean IMS</h2>

      <button className="role-btn" onClick={handleLogin} >
        Log in
      </button>
    </div>
  );
};

export default LogINAs;
