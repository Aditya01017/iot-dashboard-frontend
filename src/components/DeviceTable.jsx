import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDevices, createDevice, updateDevice, deleteDevice } from '../api/devices.api';
import { useAuth } from '../context/useAuth';
import Modal from './common/Modal';
import Button from './common/Button';
import Badge from './common/Badge';
import Skeleton from './common/Skeleton';
import EmptyState from './common/EmptyState';
import './assettable.css';

// pick a color for the status badge
const statusColor = (status) => {
  if (status === 'online') return '#10b981';
  if (status === 'idle') return '#f59e0b';
  return '#ef4444';
};

const DeviceTable = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [typeOptions, setTypeOptions] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    type: '',
    status: 'online',
    firmware: '',
    ipAddress: '',
    location: ''
  });

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const params = { page, limit, status: filterStatus, search: searchName };
        if (filterType !== 'ALL') params.type = filterType;

        const res = await getDevices(params);
        setDevices(res.data.devices);
        setTotalPages(res.data.totalPages || 1);

        // remember the list of types we have seen, for the type filter dropdown
        if (filterStatus === 'ALL' && filterType === 'ALL' && !searchName) {
          const types = [...new Set(res.data.devices.map(d => d.type))];
          setTypeOptions(types);
        }
      } catch (err) {
        console.error('Error fetching devices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, [page, limit, filterStatus, filterType, searchName]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this device?')) {
      try {
        await deleteDevice(id);
        setDevices(devices.filter(d => d._id !== id));
      } catch (err) {
        console.error('Failed to delete device', err);
      }
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({ name: '', serialNumber: '', type: '', status: 'online', firmware: '', ipAddress: '', location: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (device) => {
    setModalMode('edit');
    setEditId(device._id);
    setFormData({
      name: device.name,
      serialNumber: device.serialNumber || '',
      type: device.type,
      status: device.status,
      firmware: device.firmware || '',
      ipAddress: device.ipAddress || '',
      location: device.location || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };

      if (modalMode === 'create') {
        const res = await createDevice(payload);
        setDevices([...devices, res.data.device]);
      } else {
        const res = await updateDevice(editId, payload);
        setDevices(devices.map(d => d._id === editId ? res.data.device : d));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving device:', err);
      alert('Failed to save device');
    }
  };

  if (loading) {
    return (
      <div className="asset-table-container">
        <div style={{ marginBottom: '20px' }}>
          <Skeleton height="40px" width="250px" style={{ marginBottom: '15px' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <Skeleton height="35px" width="300px" />
            <Skeleton height="35px" width="150px" />
            <Skeleton height="35px" width="150px" />
          </div>
        </div>
        <Skeleton height="300px" />
      </div>
    );
  }

  return (
    <div className="asset-table-container">
      <div className="table-header-actions">
        <h3 style={{ margin: 0, color: '#333' }}>Hardware Nodes</h3>
        {/* only admins can add devices */}
        {isAdmin && <Button variant="primary" onClick={handleOpenCreate}>+ Add New Device</Button>}
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
          <option value="idle">Idle Devices</option>
        </select>
        <select
          className="filter-select"
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
        >
          <option value="ALL">Type: All</option>
          {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <table className="asset-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Serial No.</th>
            <th>Type</th>
            <th>Status</th>
            <th>Location</th>
            <th>IP Address</th>
            <th>Firmware</th>
            <th>Last Seen</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {devices.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ padding: 0 }}>
                <EmptyState
                  title="No hardware devices found"
                  description="Try adjusting your search or filters, or register a new device."
                  actionText={isAdmin ? "Register Device" : null}
                  onAction={isAdmin ? handleOpenCreate : null}
                />
              </td>
            </tr>
          ) : (
            devices.map(device => (
              <tr key={device._id} className="asset-tr">
                <td className="td-name">{device.name}</td>
                <td>{device.serialNumber || '-'}</td>
                <td className="td-type">{device.type}</td>
                <td><Badge text={device.status} color={statusColor(device.status)} /></td>
                <td>{device.location || '-'}</td>
                <td>{device.ipAddress || '-'}</td>
                <td>{device.firmware || '-'}</td>
                <td>{device.lastSeen ? new Date(device.lastSeen).toLocaleString() : '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="success" onClick={() => navigate(`/devices/${device._id}`)} style={{ padding: '4px 10px' }}>View Data</Button>
                    {/* only admins can edit/delete */}
                    {isAdmin && <Button variant="secondary" onClick={() => handleOpenEdit(device)} style={{ padding: '4px 10px' }}>Edit</Button>}
                    {isAdmin && <Button variant="danger" onClick={() => handleDelete(device._id)} style={{ padding: '4px 10px' }}>Delete</Button>}
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
          <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>← Previous</button>
          <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Register New Device' : 'Update Node Config'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Device Name/ID</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>

          <div className="form-group">
            <label>Serial Number</label>
            <input type="text" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} placeholder="SN-12345" required />
          </div>

          <div className="form-group">
            <label>Device Type</label>
            <input type="text" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required />
          </div>

          <div className="form-group">
            <label>Network Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="idle">Idle</option>
            </select>
          </div>

          <div className="form-group">
            <label>Location Area</label>
            <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>

          <div className="form-group">
            <label>IP Address</label>
            <input type="text" value={formData.ipAddress} onChange={e => setFormData({...formData, ipAddress: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Firmware Version</label>
            <input type="text" value={formData.firmware} onChange={e => setFormData({...formData, firmware: e.target.value})} />
          </div>

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{modalMode === 'create' ? 'Create Node' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DeviceTable;
