import { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import AlertCard from '../components/cards/AlertCard';
import Spinner from '../components/common/Spinner';
import { getAlerts, acknowledgeAlert, deleteAlert } from '../api/alerts.api';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/useAuth';

const Alerts = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [alerts, setAlerts] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterAck, setFilterAck] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterSeverity !== 'all') params.severity = filterSeverity;
      if (filterAck !== 'all') params.acknowledged = filterAck === 'ack';
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;

      const res = await getAlerts(params);
      if (res.data.success) {
        setAlerts(res.data.alerts);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filterSeverity, filterAck, dateFrom, dateTo]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleAlertTriggered = useCallback((alert) => {
    setAlerts(prev => [alert, ...prev]);
  }, []);

  useSocket(null, handleAlertTriggered, null);

  const handleAck = async (id) => {
    try {
      await acknowledgeAlert(id);
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, acknowledged: true } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this alert?')) return;
    try {
      await deleteAlert(id);
      setAlerts(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageWrapper title="Alerts">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filterSeverity} onChange={(e) => { setFilterSeverity(e.target.value); setPage(1); }}>
          <option value="all">All severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
        <select value={filterAck} onChange={(e) => { setFilterAck(e.target.value); setPage(1); }}>
          <option value="all">All</option>
          <option value="unack">Unacknowledged</option>
          <option value="ack">Acknowledged</option>
        </select>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginLeft: 'auto' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>From:</span>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <span style={{ fontSize: '14px', color: '#64748b', marginLeft: '5px' }}>To:</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : alerts.length === 0 ? (
        <p style={{ color: '#666' }}>No alerts.</p>
      ) : (
        <div>
          {alerts.map(a => (
            <AlertCard
              key={a._id}
              alert={a}
              canManage={isAdmin}
              onAcknowledge={() => handleAck(a._id)}
              onDelete={() => handleDelete(a._id)}
            />
          ))}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '14px' }}>Page {page} of {totalPages}</span>
            <div>
              <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: '6px 12px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>← Previous</button>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}>Next →</button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default Alerts;
