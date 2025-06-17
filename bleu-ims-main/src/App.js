import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login';
import Dashboard from './components/admin/dashboard';
import RecipeManagement from './components/admin/recipeManagement';
import Products from './components/admin/products';
import Ingredients from './components/admin/ingredients';
import Supplies from './components/admin/supplies';
import Merchandise from './components/admin/merchandise';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/recipeManagement" element={<RecipeManagement />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/admin/ingredients" element={<Ingredients />} />
        <Route path="/admin/supplies" element={<Supplies />} />
        <Route path="/admin/merchandise" element={<Merchandise />} />
      </Routes>
    </Router>
  );
}

export default App;
