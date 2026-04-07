import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AssetTable from '../components/AssetTable';
import AssetMap from '../components/AssetMap';
import './dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">

      <div className="sidebar">
        <h2 className="sidebar-logo">
          <span className="sidebar-logo-dot">●</span> IoT83
        </h2>
        <div className="sidebar-menu">
          <div className="sidebar-menu-item">Assets</div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout}>Secure Logout</button>
      </div>


      <div className="main-content">
        <div className="main-header">
          <h1 className="main-title">Asset Management</h1>
          <div className="network-status">
            <div className="status-dot"></div>
            Network Status: <span className="status-text">Connected</span>
          </div>
        </div>
        

        <div className="tab-system">
          <div 
            className={`tab-item ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            Asset List View
          </div>
          <div 
            className={`tab-item ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            Asset Map View
          </div>
        </div>


        <div className="tab-content">
          {activeTab === 'list' ? <AssetTable /> : <AssetMap />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
