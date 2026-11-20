import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import MetricCard from '../components/cards/MetricCard';
import DeviceCard from '../components/cards/DeviceCard';
import { useDevices } from '../hooks/useDevices';
import { useSocket } from '../hooks/useSocket';
import { getAlerts } from '../api/alerts.api';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';

const Dashboard = () => {
  const { summary, devices, loading } = useDevices();
  const [alerts, setAlerts] = useState([]);

  // latest reading of each sensor type, per device
  // shape: { deviceId: { temperature: 72, humidity: 45, ... } }
  const [readings, setReadings] = useState({});

  const handleSensorUpdate = (reading) => {
    const id = String(reading.deviceId);
    setReadings(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [reading.type]: reading.value }
    }));
  };

  const handleAlertTriggered = (alert) => {
    setAlerts(prev => [alert, ...prev].slice(0, 5));
  };

  useSocket(handleSensorUpdate, handleAlertTriggered, null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await getAlerts({ acknowledged: false });
        if (res.data.success) setAlerts(res.data.alerts.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <PageWrapper title="Dashboard Overview">
      {/* fleet summary counts */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {loading ? (
          <>
            <Skeleton height="100px" width="200px" borderRadius="8px" />
            <Skeleton height="100px" width="200px" borderRadius="8px" />
            <Skeleton height="100px" width="200px" borderRadius="8px" />
            <Skeleton height="100px" width="200px" borderRadius="8px" />
          </>
        ) : (
          <>
            <MetricCard title="Total Devices" value={summary.total} />
            <MetricCard title="Online" value={summary.online} color="green" />
            <MetricCard title="Offline" value={summary.offline} color="red" />
            <MetricCard title="Idle" value={summary.idle} color="yellow" />
          </>
        )}
      </div>

      {/* all devices with their live readings */}
      <h3>Devices</h3>
      {loading ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
          <Skeleton height="150px" width="300px" borderRadius="8px" />
          <Skeleton height="150px" width="300px" borderRadius="8px" />
          <Skeleton height="150px" width="300px" borderRadius="8px" />
        </div>
      ) : devices.length === 0 ? (
        <EmptyState
          title="No devices yet"
          description="You haven't added any devices to your dashboard. Add one from the Devices page."
          actionText="Go to Devices"
          actionLink="/devices"
        />
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
          {devices.map(d => (
            <DeviceCard key={d._id} device={d} readings={readings[String(d._id)]} />
          ))}
        </div>
      )}

      {/* recent alerts */}
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>Recent Alerts</h3>
        {alerts.length === 0 ? (
          <EmptyState
            title="No active alerts"
            description="Your devices are operating normally. Any triggered alerts will appear here."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map(a => (
              <div key={a._id} style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '15px', color: '#0f172a', marginBottom: '4px' }}>{a.deviceName}</strong>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    {a.sensorType.toUpperCase()} triggered: value <b>{a.value}</b> {a.condition} {a.threshold}
                  </span>
                </div>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  color: a.severity === 'critical' ? '#991b1b' : '#92400e',
                  backgroundColor: a.severity === 'critical' ? '#fef2f2' : '#fffbeb',
                  border: `1px solid ${a.severity === 'critical' ? '#fecaca' : '#fde68a'}`
                }}>
                  {a.severity}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
