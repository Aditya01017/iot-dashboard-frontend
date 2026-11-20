import Badge from '../common/Badge';
import Button from '../common/Button';

// canManage decides whether the acknowledge/delete buttons show (admins only)
const AlertCard = ({ alert, onAcknowledge, onDelete, canManage = true }) => {
  const sevColor = {
    info: '#3b82f6',
    warning: '#f59e0b',
    critical: '#ef4444'
  };

  return (
    <div style={{
      background: 'white',
      padding: '15px',
      marginBottom: '10px',
      borderLeft: `4px solid ${sevColor[alert.severity] || '#999'}`,
      borderRadius: '6px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <div style={{ fontWeight: 'bold' }}>{alert.deviceName}</div>
        <div style={{ color: '#666', fontSize: '14px' }}>
          {alert.sensorType} {alert.condition} {alert.threshold} (value: {alert.value})
        </div>
        <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
          {new Date(alert.triggeredAt).toLocaleString()}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Badge text={alert.severity} color={sevColor[alert.severity] || '#999'} />
        {alert.acknowledged && <span style={{ color: '#10b981', fontSize: '12px' }}>✓ Acknowledged</span>}
        {!alert.acknowledged && canManage && (
          <Button variant="success" onClick={onAcknowledge} style={{ padding: '6px 12px' }}>Acknowledge</Button>
        )}
        {canManage && (
          <Button variant="danger" onClick={onDelete} style={{ padding: '6px 12px' }}>Delete</Button>
        )}
      </div>
    </div>
  );
};

export default AlertCard;
