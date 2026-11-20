import { useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import Button from '../common/Button';

const statusColor = (s) => {
  if (s === 'online') return '#10b981';
  if (s === 'idle') return '#f59e0b';
  return '#ef4444';
};

// show a value with its unit, or -- if we dont have it yet
const fmt = (val, unit) => (val !== undefined && val !== null ? `${val} ${unit}` : '--');

const DeviceCard = ({ device, readings }) => {
  const navigate = useNavigate();
  const r = readings || {};

  return (
    <div className="device-card" style={{
      width: '280px',
      backgroundColor: '#ffffff',
      borderTop: `4px solid ${statusColor(device.status)}`,
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s ease',
      cursor: 'default'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <strong style={{ fontSize: '18px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>{device.name}</strong>
          <span style={{ color: '#64748b', fontSize: '13px' }}>{device.type}</span>
        </div>
        <Badge text={device.status} color={statusColor(device.status)} />
      </div>

      <div style={{ fontSize: '14px', color: '#475569', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Temperature</span> <strong style={{ color: '#0f172a' }}>{fmt(r.temperature, '°F')}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Humidity</span> <strong style={{ color: '#0f172a' }}>{fmt(r.humidity, '%')}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Pressure</span> <strong style={{ color: '#0f172a' }}>{fmt(r.pressure, 'hPa')}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Motion</span> <strong style={{ color: '#0f172a' }}>{r.motion !== undefined ? (r.motion ? 'Detected' : 'None') : '--'}</strong>
        </div>
      </div>

      <Button variant="secondary" onClick={() => navigate(`/devices/${device._id}`)} style={{ marginTop: 'auto', width: '100%', border: '1px solid #e2e8f0', backgroundColor: 'transparent', color: '#0f172a' }}>
        View Details
      </Button>
    </div>
  );
};

export default DeviceCard;
