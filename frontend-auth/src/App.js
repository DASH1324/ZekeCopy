import React from 'react';
import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './components/login';
import Forgotpassword from './components/forgotpassword';
import Signup from './components/signup';
import Resetpassword from './components/Resetpassword';
import Usermanagement from './components/usermanagement';
import SidebarComponent from './components/sidebar';

function App() {
  const location = useLocation();

  return (
    <div className="App" style={{ display: 'flex' }}>
      {/* Render Sidebar only on /admin/usermanagement */}
      {location.pathname === '/admin/usermanagement' && <SidebarComponent />}

      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<Forgotpassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<Resetpassword />} />
          <Route path="Usermanagement" element={<Usermanagement />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

