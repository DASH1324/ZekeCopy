import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css"; 
import Sidebar from "../sidebar"; 
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoneyBillWave,
  faChartLine,
  faShoppingCart,
  faClock,
  faArrowTrendUp,
  faArrowTrendDown
} from '@fortawesome/free-solid-svg-icons';
import { FaChevronDown, FaBell } from "react-icons/fa";
import { jwtDecode } from 'jwt-decode';

const revenueData = [
  { name: 'Jan', income: 5000, expense: 3000 },
  { name: 'Feb', income: 14000, expense: 10000 },
  { name: 'Mar', income: 15000, expense: 12000 },
  { name: 'Apr', income: 11000, expense: 9000 },
  { name: 'May', income: 13000, expense: 7000 },
  { name: 'June', income: 18000, expense: 10000 },
  { name: 'July', income: 18000, expense: 13000 },
];

const salesData = [
  { name: 'Mon', sales: 60 },
  { name: 'Tue', sales: 95 },
  { name: 'Wed', sales: 70 },
  { name: 'Thu', sales: 25 },
  { name: 'Fri', sales: 60 },
  { name: 'Sat', sales: 68 },
  { name: 'Sun', sales: 63 },
];

const summaryCardData = [
  {
    title: "Today's Sales",
    current: 28123,
    previous: 25000,
    format: "currency",
    icon: faMoneyBillWave,
    type: "sales"
  },
  {
    title: "Today's Revenue",
    current: 18003,
    previous: 17000,
    format: "currency",
    icon: faChartLine,
    type: "revenue"
  },
  {
    title: "Today's Orders",
    current: 45,
    previous: 50,
    format: "number",
    icon: faShoppingCart,
    type: "orders"
  },
  {
    title: "Pending Orders",
    current: 5,
    previous: 5,
    format: "number",
    icon: faClock,
    type: "pendings"
  }
];

const formatValue = (value, format) => {
  return format === "currency"
    ? `₱${value.toLocaleString()}`
    : value.toLocaleString();
};

const Dashboard = () => {
  const [revenueFilter, setRevenueFilter] = useState("Monthly");
  const [salesFilter, setSalesFilter] = useState("Monthly");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigate = useNavigate();
  const [userName, setUserName] = useState("Admin User");
  const [userRole, setUserRole] = useState("Admin");

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const usernameFromUrl = params.get('username');
    const tokenFromUrl = params.get('authorization');

    if (usernameFromUrl && tokenFromUrl) {
      localStorage.setItem('username', usernameFromUrl);
      localStorage.setItem('authToken', tokenFromUrl);
   
      if (window.history.replaceState) {
        const cleanUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
      }
    }

    const storedUsername = localStorage.getItem('username');
    const storedToken = localStorage.getItem('authToken');

    if (storedUsername && storedToken) {
      setUserName(storedUsername);
      try {
        const decodedToken = jwtDecode(storedToken);
        setUserRole(decodedToken.role || "Admin");
      } catch (error) {
        console.error("Error decoding token:", error);
        handleLogout();
      }
    } else {
      console.log("No session found. Redirecting to login.");
      navigate('/');
    }
  }, [navigate]); 

  useEffect(() => {
    const timerId = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timerId); 
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="dashboard-main">
        <header className="header">
          <div className="header-left">
            <h2 className="page-title">Dashboard</h2>
          </div>

          <div className="header-right">
            <div className="header-date">
              {currentDate.toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
              })}
            </div>
            <div className="header-profile">
              <div className="profile-pic" />
              <div className="profile-info">
                <div className="profile-role">Hi! I'm {userRole}</div>
                <div className="profile-name">{userName}</div>
              </div>
              <div className="dropdown-icon" onClick={toggleDropdown}>
                <FaChevronDown />
              </div>
              <div className="bell-icon">
                <FaBell className="bell-outline" />
              </div>
              {isDropdownOpen && (
                <div className="profile-dropdown">
                  <ul>
                    <li onClick={handleLogout}>Logout</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="dashboard-contents">
          <div className="dashboard-cards">
            {summaryCardData.map((card, index) => {
              const { current, previous } = card;
              const diff = current - previous;
              const percent = previous !== 0 ? (diff / previous) * 100 : 0;
              const isImproved = current > previous;
              const hasChange = current !== previous;

              return (
                <div key={index} className={`card ${card.type}`}>
                  <div className="card-text">
                    <div className="card-title">{card.title}</div>
                    <div className="card-details">
                      <div className="card-value">{formatValue(current, card.format)}</div>
                      {hasChange && (
                        <div className={`card-percent ${isImproved ? 'green' : 'red'}`}>
                          <FontAwesomeIcon icon={isImproved ? faArrowTrendUp : faArrowTrendDown} />
                             {Math.abs(percent).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-icon">
                    <FontAwesomeIcon icon={card.icon} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="dashboard-charts">
            <div className="chart-box">
              <div className="chart-header">
                <span>Revenue</span>
                <select
                  className="chart-dropdown"
                  value={revenueFilter}
                  onChange={(e) => setRevenueFilter(e.target.value)}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#00b4d8" strokeWidth={2}/>
                  <Line type="monotone" dataKey="expense" stroke="#ff4d6d" strokeWidth={2}/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <div className="chart-header">
                <span>Sales</span>
                <select
                  className="chart-dropdown"
                  value={salesFilter}
                  onChange={(e) => setSalesFilter(e.target.value)}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#00b4d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#00b4d8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;