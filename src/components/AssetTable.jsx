import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './assettable.css';

const AssetTable = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5001/api/assets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAssets(res.data.data);
      } catch (err) {
        console.error('Error fetching assets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const handleDelete = async (id) => {
    if(window.confirm('Delete this asset?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5001/api/assets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAssets(assets.filter(a => a._id !== id));
      } catch (err) {
        console.error('Failed to delete asset', err);
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>;
  }

  return (
    <div className="asset-table-container">
      <table className="asset-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Tags</th>
            <th>Device profile</th>
            <th>Health</th>
            <th>Status</th>
            <th>Alarms</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty-row-text">
                No hardware assets available.
              </td>
            </tr>
          ) : (
            assets.map(asset => (
              <tr key={asset._id} className="asset-tr">
                <td className="td-name">{asset.name}</td>
                <td className="td-tags">{(asset.tags || []).join(', ') || '-'}</td>
                <td className="td-type">{asset.assetType}</td>
                <td className={asset.health === 'Good' ? 'health-good' : 'health-poor'}>
                  {asset.health}
                </td>
                
                <td>
                  {asset.status === 'UNKNOWN' ? (
                    <div className="status-unknown-container">
                      <span className="status-unknown-title">UNKNOWN</span>
                      <span className="status-unknown-subtitle">
                        ⚠️ Details not available for asset with UNKNOWN status
                      </span>
                    </div>
                  ) : (
                    <span className={`status-badge ${asset.status === 'online' ? 'status-online' : 'status-offline'}`}>
                      {asset.status}
                    </span>
                  )}
                </td>

                <td>
                  <div className="alarms-container">
                     {asset.alarms?.critical > 0 && <span className="alarm-badge alarm-critical">Critical: {asset.alarms.critical}</span>}
                     {asset.alarms?.major > 0 && <span className="alarm-badge alarm-major">Major: {asset.alarms.major}</span>}
                     {asset.alarms?.minor > 0 && <span className="alarm-badge alarm-minor">Minor: {asset.alarms.minor}</span>}
                     {(!asset.alarms?.critical && !asset.alarms?.major && !asset.alarms?.minor) && <span className="alarm-clear">Clear</span>}
                  </div>
                </td>

                <td>
                   <button onClick={() => handleDelete(asset._id)} className="action-btn-delete">
                     Delete
                   </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssetTable;
