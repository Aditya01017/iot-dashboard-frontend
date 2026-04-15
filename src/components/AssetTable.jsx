import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './assettable.css';

const AssetTable = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);


  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    assetType: '', 
    status: 'online', 
    health: 'Good', 
    tags: '' 
  });

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5001/api/assets', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page,
            limit,
            status: filterStatus,
            name: searchName
          }
        });
        setAssets(res.data.data);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error('Error fetching assets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, [page, limit, filterStatus, searchName]);

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

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({ name: '', assetType: '', status: 'online', health: 'Good', tags: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asset) => {
    setModalMode('edit');
    setEditId(asset._id);
    setFormData({ 
      name: asset.name, 
      assetType: asset.assetType, 
      status: asset.status, 
      health: asset.health, 
      tags: asset.tags ? asset.tags.join(', ') : '' 
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: formData.name,
        assetType: formData.assetType,
        status: formData.status,
        health: formData.health,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        location: { lat: 34.0522, lng: -118.2437 }
      };

      if (modalMode === 'create') {
        const res = await axios.post('http://localhost:5001/api/assets', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAssets([...assets, res.data.data]);
      } else {
        const res = await axios.put(`http://localhost:5001/api/assets/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAssets(assets.map(a => a._id === editId ? res.data.data : a));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving asset:', err);
      alert('Failed to save asset');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>;
  }

  return (
    <div className="asset-table-container">
      <div className="table-header-actions">
        <h3 style={{ margin: 0, color: '#333' }}>Hardware Nodes</h3>
        <button className="action-btn-add" onClick={handleOpenCreate}>+ Add New Asset</button>
      </div>


      <div className="filter-bar">
        <input 
          type="text" 
          placeholder="🔍 Search hardware by name..." 
          className="filter-input"
          value={searchName}
          onChange={(e) => { setSearchName(e.target.value); setPage(1); }}
        />
        <select 
          className="filter-select"
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
        >
          <option value="ALL">Network Status: All</option>
          <option value="online">Online Only</option>
          <option value="offline">Offline Only</option>
          <option value="UNKNOWN">Errors (UNKNOWN)</option>
        </select>
      </div>

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
                   <div style={{ display: 'flex', gap: '8px' }}>
                     <button onClick={() => handleOpenEdit(asset)} className="action-btn-edit">
                       Edit
                     </button>
                     <button onClick={() => handleDelete(asset._id)} className="action-btn-delete">
                       Delete
                     </button>
                   </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>


      <div className="pagination-container">
        <span className="pagination-info">
          Page {page} of {totalPages} (Limit: {limit} nodes)
        </span>
        <div className="pagination-controls">
          <button 
            className="pagination-btn" 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>
          <button 
            className="pagination-btn" 
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      </div>


      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>{modalMode === 'create' ? 'Register New Hardware' : 'Update Node Config'}</h2>
            <form onSubmit={handleSave}>
              
              <div className="form-group">
                <label>Node Name ID</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Asset Type</label>
                <input 
                  type="text" 
                  value={formData.assetType} 
                  onChange={e => setFormData({...formData, assetType: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Network Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="UNKNOWN">UNKNOWN</option>
                </select>
              </div>

              <div className="form-group">
                <label>Physical Health Condition</label>
                <select value={formData.health} onChange={e => setFormData({...formData, health: e.target.value})}>
                  <option value="Good">Good</option>
                  <option value="Poor">Poor</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tags (Comma Separated)</label>
                <input 
                  type="text" 
                  value={formData.tags} 
                  onChange={e => setFormData({...formData, tags: e.target.value})} 
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-save">{modalMode === 'create' ? 'Create Node' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssetTable;
