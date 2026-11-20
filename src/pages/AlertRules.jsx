import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { getRules, createRule, updateRule, toggleRule, deleteRule } from '../api/alerts.api';
import { getDevices } from '../api/devices.api';
import { useAuth } from '../context/useAuth';

const AlertRules = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [rules, setRules] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    deviceId: '',
    sensorType: 'temperature',
    condition: 'gt',
    threshold: 0,
    severity: 'warning',
    notifyEmail: ''
  });

  const fetchAll = async () => {
    try {
      const rulesRes = await getRules();
      if (rulesRes.data.success) setRules(rulesRes.data.rules);

      const devRes = await getDevices();
      if (devRes.data.success) setDevices(devRes.data.devices);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      deviceId: devices[0]?._id || '',
      sensorType: 'temperature',
      condition: 'gt',
      threshold: 0,
      severity: 'warning',
      notifyEmail: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setModalMode('edit');
    setEditId(rule._id);
    setFormData({
      deviceId: rule.deviceId,
      sensorType: rule.sensorType,
      condition: rule.condition,
      threshold: rule.threshold,
      severity: rule.severity,
      notifyEmail: rule.notifyEmail || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const res = await createRule(formData);
        setRules([...rules, res.data.rule]);
      } else {
        const res = await updateRule(editId, formData);
        setRules(rules.map(r => r._id === editId ? res.data.rule : r));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save rule');
    }
  };

  const handleToggle = async (rule) => {
    try {
      const res = await toggleRule(rule._id, !rule.active);
      setRules(rules.map(r => r._id === rule._id ? res.data.rule : r));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await deleteRule(id);
      setRules(rules.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <PageWrapper title="Alert Rules"><Spinner /></PageWrapper>;

  return (
    <PageWrapper title="Alert Rules">
      {/* only admins can add rules */}
      {isAdmin && (
        <div style={{ marginBottom: '20px' }}>
          <Button variant="primary" onClick={handleOpenCreate} style={{ padding: '10px 20px' }}>+ Add New Rule</Button>
        </div>
      )}

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
              <th style={{ padding: '10px' }}>Device</th>
              <th style={{ padding: '10px' }}>Sensor</th>
              <th style={{ padding: '10px' }}>Condition</th>
              <th style={{ padding: '10px' }}>Threshold</th>
              <th style={{ padding: '10px' }}>Severity</th>
              <th style={{ padding: '10px' }}>Active</th>
              {isAdmin && <th style={{ padding: '10px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 ? (
              <tr><td colSpan={isAdmin ? 7 : 6} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No rules configured.</td></tr>
            ) : rules.map(r => {
              const device = devices.find(d => d._id === r.deviceId);
              return (
                <tr key={r._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px' }}>{device?.name || r.deviceId}</td>
                  <td style={{ padding: '10px' }}>{r.sensorType}</td>
                  <td style={{ padding: '10px' }}>{r.condition}</td>
                  <td style={{ padding: '10px' }}>{r.threshold}</td>
                  <td style={{ padding: '10px' }}>{r.severity}</td>
                  <td style={{ padding: '10px' }}>
                    <input type="checkbox" checked={r.active} onChange={() => handleToggle(r)} disabled={!isAdmin} />
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '10px' }}>
                      <Button variant="secondary" onClick={() => handleOpenEdit(r)} style={{ marginRight: '8px', padding: '4px 10px' }}>Edit</Button>
                      <Button variant="danger" onClick={() => handleDelete(r._id)} style={{ padding: '4px 10px' }}>Delete</Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'New Rule' : 'Edit Rule'}>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '12px' }}>
            <label>Device</label>
            <select value={formData.deviceId} onChange={e => setFormData({...formData, deviceId: e.target.value})} required style={{ width: '100%', padding: '6px' }}>
              <option value="">Select device</option>
              {devices.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label>Sensor Type</label>
            <select value={formData.sensorType} onChange={e => setFormData({...formData, sensorType: e.target.value})} style={{ width: '100%', padding: '6px' }}>
              <option value="temperature">temperature</option>
              <option value="humidity">humidity</option>
              <option value="motion">motion</option>
              <option value="pressure">pressure</option>
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label>Condition</label>
            <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} style={{ width: '100%', padding: '6px' }}>
              <option value="gt">greater than (gt)</option>
              <option value="lt">less than (lt)</option>
              <option value="gte">greater than or equal (gte)</option>
              <option value="lte">less than or equal (lte)</option>
              <option value="eq">equal (eq)</option>
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label>Threshold</label>
            <input type="number" step="any" value={formData.threshold} onChange={e => setFormData({...formData, threshold: parseFloat(e.target.value)})} required style={{ width: '100%', padding: '6px' }} />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label>Severity</label>
            <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})} style={{ width: '100%', padding: '6px' }}>
              <option value="info">info</option>
              <option value="warning">warning</option>
              <option value="critical">critical</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Notify Email (optional)</label>
            <input type="email" value={formData.notifyEmail} onChange={e => setFormData({...formData, notifyEmail: e.target.value})} style={{ width: '100%', padding: '6px' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save</Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
};

export default AlertRules;
