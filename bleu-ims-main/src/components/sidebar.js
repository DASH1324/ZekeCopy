import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import './sidebar.css';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars, faHome, faUtensils, faUserFriends,
  faBox, faCarrot, faTruck, faTshirt
} from '@fortawesome/free-solid-svg-icons';

function SidebarComponent() {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);
  const location = useLocation();

  return (
    <div className="sidebar-wrapper">
      {/* Sidebar Panel */}
      <Sidebar collapsed={collapsed} className={`sidebar-container ${collapsed ? 'ps-collapsed' : ''}`}>
        <div className="side-container">
          <div className={`logo-wrapper ${collapsed ? 'collapsed' : ''}`}>
            <img src={logo} alt="Logo" className="logo" />
          </div>

          {!collapsed && <div className="section-title">GENERAL</div>}
          <Menu>
            <MenuItem
              icon={<FontAwesomeIcon icon={faHome} />}
              component={<Link to="/admin/dashboard" />}
              active={location.pathname === '/admin/dashboard'}
            >
              Dashboard
            </MenuItem>
            <MenuItem
              icon={<FontAwesomeIcon icon={faBox} />}
              component={<Link to="/admin/products" />}
              active={location.pathname === '/admin/products'}
            >
              Product Management
            </MenuItem>
            <MenuItem
              icon={<FontAwesomeIcon icon={faUtensils} />}
              component={<Link to="/admin/recipeManagement" />}
              active={location.pathname === '/admin/recipeManagement'}
            >
              Recipe Management
            </MenuItem>

            {!collapsed && <div className="section-title">STOCKS</div>}
            <MenuItem
              icon={<FontAwesomeIcon icon={faCarrot} />}
              component={<Link to="/admin/ingredients" />}
              active={location.pathname === '/admin/ingredients'}
            >
              Ingredients
            </MenuItem>
            <MenuItem
              icon={<FontAwesomeIcon icon={faTruck} />}
              component={<Link to="/admin/supplies" />}
              active={location.pathname === '/admin/supplies'}
            >
              Supplies & Materials
            </MenuItem>
            <MenuItem
              icon={<FontAwesomeIcon icon={faTshirt} />}
              component={<Link to="/admin/merchandise" />}
              active={location.pathname === '/admin/merchandise'}
            >
              Merchandise
            </MenuItem>
          </Menu>
        </div>
      </Sidebar>

      {/* TOGGLE BUTTON ON THE RIGHT OF SIDEBAR */}
      <button className="toggle-btn-right" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faBars} />
      </button>
    </div>
  );
}

export default SidebarComponent;
